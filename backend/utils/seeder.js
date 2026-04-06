import 'dotenv/config';
import connectDB from '../config/db.js';
import User  from '../models/User.js';
import Product from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import Order from '../models/Order.js';

const PRODUCTS = [
  { name:'Sony WH-1000XM5 Headphones', description:'Industry-leading noise cancellation, 30hr battery, multipoint connection.', price:29990, discountPrice:24990, category:'Electronics', brand:'Sony', stock:30, isFeatured:true, images:[{url:'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}] },
  { name:'Apple MacBook Air M3', description:'15-inch Liquid Retina display, M3 chip, 18hr battery, fan-less design.', price:134900, discountPrice:124900, category:'Electronics', brand:'Apple', stock:20, isFeatured:true, images:[{url:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'}] },
  { name:'Samsung Galaxy S24 Ultra', description:'200MP camera, S Pen included, Snapdragon 8 Gen 3, titanium frame.', price:124999, discountPrice:109999, category:'Electronics', brand:'Samsung', stock:15, isFeatured:true, images:[{url:'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'}] },
  { name:'Nike Air Max 270', description:'Max Air unit in the heel for all-day comfort. Breathable mesh upper.', price:12995, discountPrice:9999, category:'Sports', brand:'Nike', stock:80, isFeatured:true, images:[{url:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'}] },
  { name:"Levi's 511 Slim Fit Jeans", description:'Slim fit jeans with stretch denim for comfort. Classic 5-pocket styling.', price:3999, discountPrice:2799, category:'Clothing', brand:"Levi's", stock:150, isFeatured:false, images:[{url:'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500'}] },
  { name:'Atomic Habits — James Clear', description:'#1 NYT bestseller. Build good habits and break bad ones with tiny changes.', price:799, discountPrice:499, category:'Books', brand:'Penguin', stock:500, isFeatured:false, images:[{url:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'}] },
  { name:'Instant Pot Duo 7-in-1', description:'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt & warmer.', price:8999, discountPrice:6499, category:'Home & Kitchen', brand:'Instant Pot', stock:60, isFeatured:true, images:[{url:'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'}] },
  { name:'Maybelline Fit Me Foundation', description:'Natural coverage, lightweight, oil-free formula. 40+ shades available.', price:699, discountPrice:499, category:'Beauty', brand:'Maybelline', stock:300, isFeatured:false, images:[{url:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500'}] },
  { name:'LEGO Technic Ferrari Daytona', description:'3778-piece set. Authentic replica of Ferrari Daytona SP3 for adults.', price:34999, discountPrice:29499, category:'Toys', brand:'LEGO', stock:12, isFeatured:false, images:[{url:'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500'}] },
  { name:'boAt Airdopes 141', description:'42hr total playback, ENx tech for clear calls, IWP instant connect.', price:1999, discountPrice:999, category:'Electronics', brand:'boAt', stock:200, isFeatured:false, images:[{url:'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'}] },
];

const seed = async () => {
  await connectDB();
  await Promise.all([Order.deleteMany(), Cart.deleteMany(), Product.deleteMany(), User.deleteMany()]);

  const admin = await User.create({ name:'Admin User', email:'admin@demo.com', password:'admin123', role:'admin' });
  await User.create({ name:'Demo User', email:'user@demo.com', password:'user123' });
  await Product.insertMany(PRODUCTS.map(p => ({ ...p, seller: admin._id })));

  console.log('✅  Seeded: 2 users + 10 products');
  console.log('   admin@demo.com / admin123');
  console.log('   user@demo.com  / user123');
  process.exit(0);
};

const destroy = async () => {
  await connectDB();
  await Promise.all([Order.deleteMany(), Cart.deleteMany(), Product.deleteMany(), User.deleteMany()]);
  console.log('✅  All data cleared');
  process.exit(0);
};

if (process.argv.includes('--destroy')) destroy(); else seed();
