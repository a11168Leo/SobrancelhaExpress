import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Category from '../categories/category.model.js';
import Service from '../services/service.model.js';

// Helper: cria ou retorna categoria por nome/nivel/pai
const getOrCreateCategory = async (name, level, parent = null) => {
  const query = { name, level, parent };
  const update = { $setOnInsert: { name, level, parent } };
  const options = { upsert: true, new: true };
  return Category.findOneAndUpdate(query, update, options);
};

// Helper: cria ou atualiza servico
const upsertService = async (data) => {
  const query = {
    name: data.name,
    category: data.category,
    subcategory: data.subcategory,
    subcategory2: data.subcategory2,
    subcategory3: data.subcategory3
  };
  const update = { $set: data };
  const options = { upsert: true, new: true };
  return Service.findOneAndUpdate(query, update, options);
};

const seed = async () => {
  await connectDB();

  // Categoria raiz (nivel 0)
  const root = await getOrCreateCategory('Sobrancelhas Express Portugal', 0, null);

  // Nivel 1
  const catDepilacao = await getOrCreateCategory('Depilacao e Design', 1, root._id);
  const catMicro = await getOrCreateCategory('Micropigmentacao e Nano Fios', 1, root._id);
  const catPestanas = await getOrCreateCategory('Pestanas e Tintura', 1, root._id);
  const catFacial = await getOrCreateCategory('Tratamento Facial', 1, root._id);
  const catCorporal = await getOrCreateCategory('Tratamento Corporal', 1, root._id);

  // Nivel 2 e 3 (servicos)
  const services = [];

  // Depilacao e Design -> Sobrancelhas Threading
  const depThreading = await getOrCreateCategory('Sobrancelhas Threading', 2, catDepilacao._id);
  const depThreading3 = await getOrCreateCategory(
    'Sobrancelhas Threading',
    3,
    depThreading._id
  );
  services.push({
    name: 'Sobrancelhas Threading',
    price: 8,
    durationMinutes: 15,
    maxDurationMinutes: 90,
    description: 'Desde 8 EUR (15 min a 1h30)',
    category: root._id,
    subcategory: catDepilacao._id,
    subcategory2: depThreading._id,
    subcategory3: depThreading3._id
  });

  const depilacaoItems = [
    { name: 'Buco', price: 8, minutes: 15 },
    { name: 'Design sobrancelhas', price: 15, minutes: 30 },
    { name: 'Combo Design + Buco', price: 22, minutes: 30 },
    { name: 'Design com Henna', price: 25, minutes: 30 },
    { name: 'Combo Design + buco + Queixo', price: 27, minutes: 30 },
    { name: 'Combo Design + Rosto Completo', price: 32, minutes: 30 },
    { name: 'Combo Design com Henna + Buco', price: 32, minutes: 30 },
    { name: 'Brow Lamination sem coloracao', price: 35, minutes: 60 },
    { name: 'Brow Lamination com coloracao', price: 40, minutes: 60 },
    { name: 'Brow Lamination + Lash Lifting', price: 65, minutes: 90 }
  ];

  for (const item of depilacaoItems) {
    const cat3 = await getOrCreateCategory(item.name, 3, depThreading._id);
    services.push({
      name: item.name,
      price: item.price,
      durationMinutes: item.minutes,
      category: root._id,
      subcategory: catDepilacao._id,
      subcategory2: depThreading._id,
      subcategory3: cat3._id
    });
  }

  // Depilacao Permanente
  const depPermanente = await getOrCreateCategory('Depilacao Permanente', 2, catDepilacao._id);
  const depLaser = await getOrCreateCategory(
    'Depilacao a Laser (Zonas a consultar)',
    3,
    depPermanente._id
  );
  services.push({
    name: 'Depilacao a Laser (Zonas a consultar)',
    price: 15,
    durationMinutes: 0,
    description: 'Desde 15 EUR (tempo sob consulta)',
    category: root._id,
    subcategory: catDepilacao._id,
    subcategory2: depPermanente._id,
    subcategory3: depLaser._id
  });

  // Micropigmentacao e Nano Fios -> Microblading & Micropigmentacao
  const micro2 = await getOrCreateCategory('Microblading & Micropigmentacao', 2, catMicro._id);

  const microItems = [
    {
      name: 'Micropigmentacao / Microblading',
      price: 0.01,
      minutes: 30,
      maxMinutes: 150,
      desc: 'Desde 0,01 EUR (30 min a 2h30)'
    },
    { name: 'Retoque 30 dias', price: 0.01, minutes: 30 },
    { name: 'Remocao de Micro', price: 50, minutes: 60 },
    { name: 'Retoque apos 60 dias', price: 50, minutes: 60 },
    { name: 'Manutencao antes de 1 ano', price: 100, minutes: 60 },
    { name: 'Manutencao Anual', price: 150, minutes: 60 },
    { name: 'Micro Eyeliner', price: 220, minutes: 90 },
    { name: 'Micro Labial', price: 220, minutes: 90 },
    { name: 'Micro e Nano (Retoque Incluido)', price: 220, minutes: 60 },
    { name: 'Combo Micro Sobrancelhas + Labios', price: 380, minutes: 150 }
  ];

  for (const item of microItems) {
    const cat3 = await getOrCreateCategory(item.name, 3, micro2._id);
    services.push({
      name: item.name,
      price: item.price,
      durationMinutes: item.minutes,
      maxDurationMinutes: item.maxMinutes,
      description: item.desc,
      category: root._id,
      subcategory: catMicro._id,
      subcategory2: micro2._id,
      subcategory3: cat3._id
    });
  }

  // Pestanas e Tintura -> Extensao de Pestanas e Cuidados
  const pestanas2 = await getOrCreateCategory(
    'Extensao de Pestanas e Cuidados',
    2,
    catPestanas._id
  );

  const pestanasItems = [
    { name: 'Coloracao e Henna brow e lash', price: 10, minutes: 30 },
    { name: 'Remocao de Pestanas', price: 10, minutes: 30 },
    { name: 'Manutencao 15 dias', price: 35, minutes: 120 },
    { name: 'Manutencao ate 3 semanas', price: 40, minutes: 120 },
    { name: 'Aplicacao 1a vez', price: 45, minutes: 120 },
    { name: 'Manutencao apos 30 dias', price: 45, minutes: 120 },
    { name: 'Lash Lifting (incluido em combos ou sob consulta)', price: 0.01, minutes: 0 }
  ];

  for (const item of pestanasItems) {
    const cat3 = await getOrCreateCategory(item.name, 3, pestanas2._id);
    services.push({
      name: item.name,
      price: item.price,
      durationMinutes: item.minutes,
      description:
        item.price === 0 ? 'Preco sob consulta' : undefined,
      category: root._id,
      subcategory: catPestanas._id,
      subcategory2: pestanas2._id,
      subcategory3: cat3._id
    });
  }

  // Tratamento Facial -> Lifting e Rejuvenescimento Facial
  const facial2 = await getOrCreateCategory(
    'Lifting e Rejuvenescimento Facial',
    2,
    catFacial._id
  );

  const facialItems = [
    { name: 'Lifting Facial HIFU', price: 150, minutes: 0, desc: 'Tempo sob consulta' },
    { name: 'Peeling Facial', price: 0.01, minutes: 0, desc: 'Preco sob consulta' },
    { name: 'Limpeza Facial Profunda', price: 0.01, minutes: 0, desc: 'Preco sob consulta' },
    { name: 'Tratamento Facial (Especifico)', price: 0.01, minutes: 0, desc: 'Preco sob consulta' },
    { name: 'Faciais - Homem', price: 0.01, minutes: 0, desc: 'Preco sob consulta' },
    { name: 'Maquilhagem', price: 0.01, minutes: 0, desc: 'Preco sob consulta' }
  ];

  for (const item of facialItems) {
    const cat3 = await getOrCreateCategory(item.name, 3, facial2._id);
    services.push({
      name: item.name,
      price: item.price,
      durationMinutes: item.minutes,
      description: item.desc,
      category: root._id,
      subcategory: catFacial._id,
      subcategory2: facial2._id,
      subcategory3: cat3._id
    });
  }

  // Tratamento Corporal -> Tratamentos Anticeluliticos e Redutores
  const corporal2 = await getOrCreateCategory(
    'Tratamentos Anticeluliticos e Redutores',
    2,
    catCorporal._id
  );

  const corporalItems = [
    { name: 'HIFU corporal', price: 100, minutes: 30 },
    { name: 'Cavitacao', price: 0.01, minutes: 0, desc: 'Preco sob consulta' },
    { name: 'Tratamentos para Perda de Peso', price: 0.01, minutes: 0, desc: 'Preco sob consulta' }
  ];

  for (const item of corporalItems) {
    const cat3 = await getOrCreateCategory(item.name, 3, corporal2._id);
    services.push({
      name: item.name,
      price: item.price,
      durationMinutes: item.minutes,
      description: item.desc,
      category: root._id,
      subcategory: catCorporal._id,
      subcategory2: corporal2._id,
      subcategory3: cat3._id
    });
  }

  // Grava servicos
  for (const service of services) {
    await upsertService(service);
  }

  console.log(`Seed concluido: ${services.length} servicos`);
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Erro no seed:', error);
  mongoose.disconnect();
  process.exit(1);
});
