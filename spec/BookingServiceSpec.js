var RoomRepository = (function () {
    return {
        "27/03/2015-10/04/2015": ["single", "double", "suite", "nuptial suite"],
        "27/04/2015-10/05/2015": []
    }
});

var PriceService = (function () {
    var roomPrices = {
        "suite": 150,
        "nuptial suite": 200
    };
    
    var servicesPrices = {
        "wifi": 10,
        "laundry": 15,
        "early check in": 20,
        "late checkout": 20
    };
    
    function getRoomPrice(roomType) {
        return roomPrices[roomType];
    }

    function getServicePrice(serviceType) {
        return servicesPrices[serviceType];
    }

    return {
        "getRoomPrice": getRoomPrice,
        "getServicePrice": getServicePrice
    }
});

var BookingService = (function (roomRepository) {
    var priceCalculator = {
        "suite": function (services) {
            var priceService = new PriceService();
            var price = priceService.getRoomPrice("suite");
            for(var service of services){
                if(service === "wifi") continue;
                if(service === "late checkout") continue;
                price += priceService.getServicePrice(service);
            }
            return price;
        },
        "nuptial suite": function (services) {
            return new PriceService().getRoomPrice("nuptial suite");
        }

    };

    function checkAvailability(checkInDate, checkoutDate) {
        return roomRepository[checkInDate + "-" + checkoutDate];
    }

    function checkPrice(bookingRequest) {
        return priceCalculator[bookingRequest.roomType](bookingRequest.services);
    }

    return {
        checkAvailability: checkAvailability,
        checkPrice: checkPrice
    }
});

var BookingRequest = (function (checkInDate, checkoutDate, roomType, services) {
    this.checkInDate = checkInDate;
    this.checkoutDate = checkoutDate;
    this.roomType = roomType;
    this.services = services;
});

describe("Booking service", function () {
    var bookingService;
    beforeAll(function () {
        bookingService = new BookingService(new RoomRepository());
    });
    describe("checking room availability", function () {
        it("when hotel is empty", function () {
            expect(bookingService.checkAvailability("27/03/2015", "10/04/2015")).toEqual(["single", "double", "suite", "nuptial suite"]);
        });
        it("when hotel is full", function () {
            expect(bookingService.checkAvailability("27/04/2015", "10/05/2015")).toEqual([]);
        });
    });

    describe("booking a room", function () {
        it("nuptial suite includes all services for free", function () {
            var fullNuptialRequest = new BookingRequest("27/03/2015", "29/03/2015", "nuptial suite", ["wifi", "laundry", "early check in", "late checkout"]);
            var emptyNuptialRequest = new BookingRequest("27/03/2015", "29/03/2015", "nuptial suite", []);
            expect(bookingService.checkPrice(fullNuptialRequest)).toBe(bookingService.checkPrice(emptyNuptialRequest));
        });
        it(" suite includes wifi and late checkout services for free", function () {
            var fullSuite = new BookingRequest("27/03/2015", "29/03/2015", "suite", ["wifi", "laundry", "early check in", "late checkout"]);
            var wifiCheckoutLaundrySuiteRequest = new BookingRequest("27/03/2015", "29/03/2015", "suite", ["wifi", "laundry", "late checkout"]);
            expect(bookingService.checkPrice(fullSuite)).toBeGreaterThan(bookingService.checkPrice(wifiCheckoutLaundrySuiteRequest));
        });
    });
});