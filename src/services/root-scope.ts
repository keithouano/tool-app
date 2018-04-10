export let LogDetails = {
    customerName: '',
    customerId: '',
    UUID: '',
    mobileNo: '',
    emailId: '',
    country:'AE',
    language: 'en',
    currencyCode : 'AED',
    hasCard : 0,
    bookingId : '',
    vehicleNo : '',
    driverName : '',
    bookingUUID : '',
    deviceToken : '',
    drvReached : -1,
    currentMap: [],
    recentLoc: [],
    sessionId: '',
    geofencePass: false
}

export let CardDetails = {
    customerName: '',
    cardNumber: '',
    expiryDate: '',
    cardType: '',
    ccv:''
}

export let ProfileDetails = {
    profileId: '',
    name: '',
    email: '',
    contactNo: ''
}

export let BookingHistory = {
    bookingHistoryDetails: ''
}
export let maplatlng = {
    lat: '',
    lng: '',
    pickup: '',
    dropoff: '',
    pickupLatLng: {},
    dropLatLng:{},
    dataflag: 0,
    homeView:'D',
    selMenu:'H'
}
export let customerCurrentLatLng = {
    latitude: '',
    longitude: '',
}
export let trackingTrip = {
    pickup: '',
    drop: '',
}
export let currentLatLng = {
    latitude: 0,
    longitude: 0,
    speed: 0,
    formattedAddress:''
}
export let paymentDetails = {
    paymentType: 'Cash',
    cardName: '',
    cardNo: '',
    expieryDate: '',
    cvv: '',
    cardType: '',
    cardModel: ''
}
export let HomeNav = {
    paymentScreen: ''
}

export let FindingNav = {
    findingScreen: ''
    
}
export let DriverDetails = {
    driverDetail:'',
    driverName: '',
    driverId: '',
    driverRank: 0,
    vehicleNo: '',
    bookingNo: '',
    bookingStatus: '',
    bookingId: '',
    bookingUUID : '',
    driverPhoto : ''
}
export let LiveVehicleDetails = {
    liveVehicles: '',
    vehicleType: '',
    vehicleLat: '',
    vehicleLng: ''
}

export let BidDetails = {
    bidList: '',
    vehicleNo: '',
    driverId: '',
    driverName: '',
    driverRank: 0,
    bidStatus: '',
    bookingStatus: '',
    acceptedBooking: '',
    dropOffChanged: 0
}

export let SystemParams = {
  shareLinkMessage : "Happy to share your deared ones trip on Arabia Taxi.",
  shareLinkUrl : "http://viaextech.com/",
  driverPhotoUrl : "",
  radius : 0,
  vehiclePollInterval : 15
}

export let serviceUrl = {

    //baseUrl: 'http://192.168.1.104:8090/taxi-booking-service-api/'
    
    //baseUrl: 'http://172.16.4.53:8090/taxi-booking-service-api/'
    //baseUrl: 'http://86.96.193.142:9096/taxi-booking-service-api/'
    baseUrl: 'https://custapi.focaltrack.ae:9096/taxi-booking-service-api/'

}

