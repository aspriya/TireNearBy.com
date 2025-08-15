// Simple in-memory data store (replace with a persistent DB later)
import { v4 as uuid } from 'uuid';

const shops = new Map(); // id -> shop {id,name,address,phone,tires: [{id, code, brand, model, size, price, quantity}]}

export function listShops() {
  return Array.from(shops.values());
}

export function getShop(id) {
  return shops.get(id) || null;
}

export function createShop({ name, address, phone }) {
  const id = uuid();
  const shop = { id, name, address, phone, tires: [], createdAt: Date.now() };
  shops.set(id, shop);
  return shop;
}

export function addTireToShop(shopId, tire) {
  const shop = shops.get(shopId);
  if (!shop) throw new Error('Shop not found');
  const id = uuid();
  const record = { id, ...tire };
  shop.tires.push(record);
  return record;
}

export function listTiresNearby(/* coordsFuture */) {
  // For now ignore geo filtering
  return listShops().flatMap((s) => s.tires.map((t) => ({ shopId: s.id, shopName: s.name, ...t })));
}

// Demo seed
if (shops.size === 0) {
  const demo = createShop({ name: 'Demo Tire Center', address: '123 Main St', phone: '+1-555-1234' });
  addTireToShop(demo.id, { code: 'P235/65R17 104T', brand: 'Goodyear', model: 'Assurance', size: '235/65R17', price: 129.99, quantity: 8 });
  const urban = createShop({ name: 'Urban Wheel & Tire', address: '456 Market Ave', phone: '+1-555-7890' });
  addTireToShop(urban.id, { code: '205/55R16 91V', brand: 'Michelin', model: 'Primacy', size: '205/55R16', price: 149.5, quantity: 12 });
  const highway = createShop({ name: 'Highway Grip Pros', address: '78 Service Rd', phone: '+1-555-6622' });
  addTireToShop(highway.id, { code: '275/60R20 115S', brand: 'Bridgestone', model: 'Dueler', size: '275/60R20', price: 219.0, quantity: 5 });
}
