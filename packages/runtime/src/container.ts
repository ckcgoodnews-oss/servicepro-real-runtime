export class ServiceContainer{private services=new Map();register(k,v){this.services.set(k,v)}resolve(k){return this.services.get(k)}}
