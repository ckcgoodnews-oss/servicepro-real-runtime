const { makeId, now } = require('../services/id');

function createBlogRepository(store) {
  if (store.type === 'json') return createJson(store);
  if (store.type === 'postgres') return createPostgres(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJson(store) {
  function ensure(data) { data.blogPosts ||= []; return data; }
  return {
    list(tenantId) { return ensure(store.read()).blogPosts.filter(p => p.tenantId === tenantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    create(tenantId, input, userId) {
      const data = ensure(store.read());
      const post = { id: makeId('post'), tenantId, title: input.title || '', body: input.body || '', excerpt: input.excerpt || '', imageUrl: input.imageUrl || '', category: input.category || '', published: input.published || false, authorId: userId, createdAt: now(), updatedAt: now() };
      data.blogPosts.push(post); store.write(data); return post;
    },
    update(tenantId, id, input) {
      const data = ensure(store.read());
      const post = data.blogPosts.find(p => p.tenantId === tenantId && p.id === id);
      if (!post) return null;
      Object.assign(post, { ...input, updatedAt: now() }); store.write(data); return post;
    },
    remove(tenantId, id) {
      const data = ensure(store.read());
      const before = data.blogPosts.length;
      data.blogPosts = data.blogPosts.filter(p => !(p.tenantId === tenantId && p.id === id));
      if (data.blogPosts.length === before) return false;
      store.write(data); return true;
    },
    async publicList(slug) {
      const data = ensure(store.read());
      const settings = (data.tenantSettings || []).find(s => (s.branding?.publicSlug || '').toLowerCase() === slug.toLowerCase() && s.branding?.publicPublished);
      if (!settings) return [];
      return data.blogPosts.filter(p => p.tenantId === settings.tenantId && p.published).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
  };
}

function createPostgres(store) {
  const select = `SELECT id::text, tenant_id AS "tenantId", title, body, excerpt, image_url AS "imageUrl", category, published, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt" FROM blog_posts`;
  return {
    async list(tenantId) { return (await store.query(`${select} WHERE tenant_id=$1 ORDER BY created_at DESC`, [tenantId])).rows; },
    async create(tenantId, input, userId) {
      try {
        await store.query(`CREATE TABLE IF NOT EXISTS blog_posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id text NOT NULL, title text NOT NULL DEFAULT '', body text NOT NULL DEFAULT '', excerpt text NOT NULL DEFAULT '', image_url text NOT NULL DEFAULT '', category text NOT NULL DEFAULT '', published boolean NOT NULL DEFAULT false, author_id text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now())`);
      } catch {}
      const result = await store.query(`INSERT INTO blog_posts (tenant_id, title, body, excerpt, image_url, category, published, author_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id::text, tenant_id AS "tenantId", title, body, excerpt, image_url AS "imageUrl", category, published, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"`, [tenantId, input.title || '', input.body || '', input.excerpt || '', input.imageUrl || '', input.category || '', input.published || false, userId || '']);
      return result.rows[0];
    },
    async update(tenantId, id, input) {
      const fields = []; const values = [tenantId, id]; let idx = 3;
      for (const [key, col] of [['title','title'],['body','body'],['excerpt','excerpt'],['imageUrl','image_url'],['category','category'],['published','published']]) {
        if (input[key] !== undefined) { fields.push(`${col}=$${idx++}`); values.push(input[key]); }
      }
      if (!fields.length) return null;
      fields.push(`updated_at=now()`);
      const result = await store.query(`UPDATE blog_posts SET ${fields.join(',')} WHERE tenant_id=$1 AND id=$2::uuid RETURNING id::text, tenant_id AS "tenantId", title, body, excerpt, image_url AS "imageUrl", category, published, author_id AS "authorId", created_at AS "createdAt", updated_at AS "updatedAt"`, values);
      return result.rows[0] || null;
    },
    async remove(tenantId, id) {
      const result = await store.query(`DELETE FROM blog_posts WHERE tenant_id=$1 AND id=$2::uuid`, [tenantId, id]);
      return result.rowCount > 0;
    },
    async publicList(slug) {
      try {
        const result = await store.query(`SELECT b.id::text, b.title, b.excerpt, b.image_url AS "imageUrl", b.category, b.created_at AS "createdAt" FROM blog_posts b JOIN tenant_settings s ON s.tenant_id = b.tenant_id WHERE lower(s.branding->>'publicSlug') = lower($1) AND (s.branding->>'publicPublished')::boolean = true AND b.published = true ORDER BY b.created_at DESC LIMIT 20`, [slug]);
        return result.rows;
      } catch { return []; }
    }
  };
}

module.exports = { createBlogRepository };
