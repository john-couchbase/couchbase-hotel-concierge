/* Public application tool contracts from lib/engine.py. */
const HotelTools=[
  {
    "name": "check_loyalty_tier",
    "description": "Check membership before upgrade",
    "inputs": {}
  },
  {
    "name": "find_reservations",
    "description": "Read current session bookings and upgrade allowance",
    "inputs": {}
  },
  {
    "name": "validate_stay",
    "description": "Validate dates and guests",
    "inputs": {
      "start": "string",
      "end": "string",
      "guests": "integer"
    }
  },
  {
    "name": "search_rooms",
    "description": "Find fictional room offers after validated dates",
    "inputs": {}
  },
  {
    "name": "quote_room",
    "description": "Calculate total including 10% demo tax",
    "inputs": {
      "room_id": "string"
    }
  },
  {
    "name": "create_reservation",
    "description": "Request approval for a quoted room booking",
    "inputs": {
      "room_id": "string"
    }
  },
  {
    "name": "apply_upgrade",
    "description": "Apply one complimentary upgrade when policy checks pass",
    "inputs": {}
  },
  {
    "name": "get_outlet_hours",
    "description": "Read restaurant hours before booking dinner",
    "inputs": {}
  },
  {
    "name": "book_restaurant",
    "description": "Request fictional table; requires date time and party size",
    "inputs": {
      "date": "string",
      "hour": "integer",
      "guests": "integer"
    }
  },
  {
    "name": "check_departure_schedule",
    "description": "Check late checkout availability for an active room",
    "inputs": {}
  },
  {
    "name": "update_checkout",
    "description": "Set late checkout after checking the departure schedule",
    "inputs": {}
  },
  {
    "name": "cancel_reservation",
    "description": "Request guest approval to cancel one booking",
    "inputs": {
      "reference": "string"
    }
  }
];
