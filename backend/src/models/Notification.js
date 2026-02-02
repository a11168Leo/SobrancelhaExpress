const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Quem vai receber o alerta (Profissional ou Admin)
  recipientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  title: { 
    type: String, 
    required: true 
  }, // Ex: "Novo Agendamento!"
  
  message: { 
    type: String, 
    required: true 
  }, // Ex: "Maria marcou Design de Sobrancelha às 14:00"

  // Para o profissional saber se já viu ou não
  read: { 
    type: Boolean, 
    default: false 
  },

  // Tipo de alerta para ícones diferentes no Dashboard
  type: { 
    type: String, 
    enum: ['INFO', 'SUCCESS', 'WARNING', 'DANGER'], 
    default: 'INFO' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);