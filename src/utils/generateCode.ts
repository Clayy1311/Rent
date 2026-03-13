export const generateBookingCode = () => {

    const random =
      Math.random().toString(36).substring(2, 8).toUpperCase()
  
    return `TRX-AZKA_OUTDOOR-${random}`
  
  }