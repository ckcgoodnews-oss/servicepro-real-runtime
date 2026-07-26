const { makeId, now } = require('../services/id');

function createWebsiteBuilderRepository(store) {
  if (store.type === 'json') return createJsonImpl(store);
  if (store.type === 'postgres') return createPostgresImpl(store);
  throw new Error(`Unsupported store type: ${store.type}`);
}

function createJsonImpl(store) {
  function data() { return store.read(); }
  function save(d) { store.write(d); }

  return {
    listPages(tenantId) {
      const d = data();
      d.websitePages ||= [];
      return d.websitePages.filter(p => p.tenantId === tenantId).sort((a, b) => a.order - b.order);
    },

    findPageById(tenantId, id) {
      const d = data();
      d.websitePages ||= [];
      return d.websitePages.find(p => p.tenantId === tenantId && p.id === id) || null;
    },

    findPageBySlug(tenantId, slug) {
      const d = data();
      d.websitePages ||= [];
      return d.websitePages.find(p => p.tenantId === tenantId && p.slug === slug) || null;
    },

    createPage(tenantId, input) {
      const d = data();
      d.websitePages ||= [];
      if (!input.title) { const err = new Error('Page title is required'); err.status = 400; err.code = 'validation_failed'; throw err; }
      const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (d.websitePages.some(p => p.tenantId === tenantId && p.slug === slug)) {
        const err = new Error('A page with this slug already exists'); err.status = 409; err.code = 'conflict'; throw err;
      }
      const page = {
        id: makeId('page'),
        tenantId,
        title: input.title,
        slug,
        sections: input.sections || [],
        seo: input.seo || { title: input.title, description: '', keywords: '' },
        status: input.status || 'draft',
        template: input.template || 'blank',
        order: d.websitePages.filter(p => p.tenantId === tenantId).length,
        publishedAt: '',
        version: 1,
        createdBy: input.createdBy || '',
        createdAt: now(),
        updatedAt: now()
      };
      d.websitePages.push(page);
      save(d);
      return page;
    },

    updatePage(tenantId, id, input) {
      const d = data();
      d.websitePages ||= [];
      const page = d.websitePages.find(p => p.tenantId === tenantId && p.id === id);
      if (!page) return null;
      for (const key of ['title', 'slug', 'sections', 'seo', 'status', 'template', 'order']) {
        if (input[key] !== undefined) page[key] = input[key];
      }
      if (input.status === 'published' && !page.publishedAt) page.publishedAt = now();
      page.version = (page.version || 1) + 1;
      page.updatedAt = now();
      save(d);
      return page;
    },

    deletePage(tenantId, id) {
      const d = data();
      d.websitePages ||= [];
      const idx = d.websitePages.findIndex(p => p.tenantId === tenantId && p.id === id);
      if (idx < 0) return null;
      const removed = d.websitePages.splice(idx, 1)[0];
      save(d);
      return removed;
    },

    publishPage(tenantId, id) {
      return this.updatePage(tenantId, id, { status: 'published' });
    },

    unpublishPage(tenantId, id) {
      return this.updatePage(tenantId, id, { status: 'draft', publishedAt: '' });
    },

    // Theme management
    getTheme(tenantId) {
      const d = data();
      d.websiteThemes ||= [];
      return d.websiteThemes.find(t => t.tenantId === tenantId) || {
        tenantId,
        primaryColor: '#1a73e8',
        secondaryColor: '#34a853',
        fontFamily: 'Inter, sans-serif',
        headerStyle: 'fixed',
        footerStyle: 'standard',
        customCss: ''
      };
    },

    updateTheme(tenantId, input) {
      const d = data();
      d.websiteThemes ||= [];
      let theme = d.websiteThemes.find(t => t.tenantId === tenantId);
      if (!theme) { theme = { tenantId, createdAt: now() }; d.websiteThemes.push(theme); }
      Object.assign(theme, input, { updatedAt: now() });
      save(d);
      return theme;
    },

    // Media library
    listMedia(tenantId) {
      const d = data();
      d.websiteMedia ||= [];
      return d.websiteMedia.filter(m => m.tenantId === tenantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    addMedia(tenantId, input) {
      const d = data();
      d.websiteMedia ||= [];
      const media = { id: makeId('media'), tenantId, filename: input.filename, url: input.url, mimeType: input.mimeType, sizeBytes: input.sizeBytes || 0, alt: input.alt || '', createdAt: now() };
      d.websiteMedia.push(media);
      save(d);
      return media;
    },

    deleteMedia(tenantId, id) {
      const d = data();
      d.websiteMedia ||= [];
      const idx = d.websiteMedia.findIndex(m => m.tenantId === tenantId && m.id === id);
      if (idx < 0) return null;
      return d.websiteMedia.splice(idx, 1)[0];
    },

    // Section templates
    getSectionTemplates() {
      return [
        { key: 'hero', label: 'Hero Banner', fields: ['title', 'subtitle', 'ctaText', 'ctaLink', 'backgroundImage'] },
        { key: 'services', label: 'Services Grid', fields: ['title', 'services'] },
        { key: 'testimonials', label: 'Testimonials', fields: ['title', 'testimonials'] },
        { key: 'about', label: 'About Section', fields: ['title', 'content', 'image'] },
        { key: 'contact', label: 'Contact Form', fields: ['title', 'email', 'phone', 'address'] },
        { key: 'gallery', label: 'Image Gallery', fields: ['title', 'images'] },
        { key: 'cta', label: 'Call to Action', fields: ['title', 'text', 'buttonText', 'buttonLink'] },
        { key: 'faq', label: 'FAQ', fields: ['title', 'questions'] },
        { key: 'pricing', label: 'Pricing Table', fields: ['title', 'plans'] },
        { key: 'team', label: 'Team Members', fields: ['title', 'members'] },
        { key: 'features', label: 'Features List', fields: ['title', 'features'] },
        { key: 'text', label: 'Rich Text', fields: ['content'] },
        { key: 'html', label: 'Custom HTML', fields: ['html'] }
      ];
    }
  };
}

function createPostgresImpl(store) {
  return createJsonImpl(store);
}

module.exports = { createWebsiteBuilderRepository };
