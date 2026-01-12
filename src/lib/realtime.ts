import mongoose from 'mongoose';
import { Hospital, Doctor, Appointment, User, Review } from '@/models';

// Real-time data update utilities
export class RealTimeDataManager {
  
  // Update bed availability in real-time
  static async updateBedAvailability(hospitalId: string, bedType: 'general' | 'icu' | 'oxygen' | 'ventilator', occupied: number) {
    try {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) throw new Error('Hospital not found');

      hospital.beds[bedType].occupied = occupied;
      hospital.beds[bedType].available = Math.max(0, hospital.beds[bedType].total - occupied);
      hospital.lastBedUpdate = new Date();
      
      await hospital.save();
      return hospital.beds[bedType];
    } catch (error) {
      console.error('Error updating bed availability:', error);
      throw error;
    }
  }

  // Update blood bank inventory in real-time
  static async updateBloodInventory(hospitalId: string, bloodGroup: string, units: number) {
    try {
      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) throw new Error('Hospital not found');

      const bloodStock = hospital.bloodBank.find(stock => stock.bloodGroup === bloodGroup);
      if (bloodStock) {
        bloodStock.units = Math.max(0, units);
        bloodStock.lastUpdated = new Date();
      }
      
      hospital.lastBloodUpdate = new Date();
      await hospital.save();
      return bloodStock;
    } catch (error) {
      console.error('Error updating blood inventory:', error);
      throw error;
    }
  }

  // Get real-time hospital statistics
  static async getHospitalStats() {
    try {
      const stats = await Hospital.aggregate([
        {
          $group: {
            _id: null,
            totalHospitals: { $sum: 1 },
            totalGeneralBeds: { $sum: '$beds.general.total' },
            availableGeneralBeds: { $sum: '$beds.general.available' },
            totalICUBeds: { $sum: '$beds.icu.total' },
            availableICUBeds: { $sum: '$beds.icu.available' },
            totalOxygenBeds: { $sum: '$beds.oxygen.total' },
            availableOxygenBeds: { $sum: '$beds.oxygen.available' },
            totalVentilatorBeds: { $sum: '$beds.ventilator.total' },
            availableVentilatorBeds: { $sum: '$beds.ventilator.available' }
          }
        }
      ]);

      const bloodStats = await Hospital.aggregate([
        { $unwind: '$bloodBank' },
        {
          $group: {
            _id: '$bloodBank.bloodGroup',
            totalUnits: { $sum: '$bloodBank.units' },
            hospitalCount: { $sum: 1 }
          }
        },
        { $sort: { totalUnits: -1 } }
      ]);

      return {
        bedStats: stats[0] || {},
        bloodStats,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error getting hospital stats:', error);
      throw error;
    }
  }

  // Real-time appointment updates
  static async updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled' | 'no-show', notes?: string) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) throw new Error('Appointment not found');

      appointment.status = status;
      if (notes) appointment.notes = notes;
      
      await appointment.save();
      return appointment;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  // Get real-time dashboard data
  static async getDashboardData() {
    try {
      const [hospitalStats, appointmentStats, userStats] = await Promise.all([
        this.getHospitalStats(),
        this.getAppointmentStats(),
        this.getUserStats()
      ]);

      return {
        hospitals: hospitalStats,
        appointments: appointmentStats,
        users: userStats,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  private static async getAppointmentStats() {
    const stats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow }
    });

    return {
      byStatus: stats,
      todayCount: todayAppointments
    };
  }

  private static async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    return stats;
  }
}

// WebSocket-like event emitter for real-time updates
export class HealthDataEvents {
  private static listeners: Map<string, Function[]> = new Map();

  static on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  static emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  static off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}