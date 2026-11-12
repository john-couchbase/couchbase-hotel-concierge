/* Generated from lib/policies.json. Public demo rules, never credentials. */
const HotelPolicies=[
  {
    "id": "room",
    "name": "harborline_room_policy",
    "title": "Find or book a room",
    "description": "Search rooms, quote a room, or create a new room booking, including follow-up choices.",
    "tools": [
      "validate_stay",
      "search_rooms",
      "quote_room",
      "create_reservation"
    ],
    "content": "Ask for dates and guests. Validate before search and quote. Request explicit approval before creating any room booking.",
    "version": "sha256:c895ccd55827"
  },
  {
    "id": "upgrade",
    "name": "harborline_upgrade_policy",
    "title": "Room upgrade",
    "description": "Upgrade an existing room using membership and the one-upgrade allowance.",
    "tools": [
      "check_loyalty_tier",
      "find_reservations",
      "apply_upgrade"
    ],
    "content": "Check membership, then find the active reservation. Gold or Platinum can receive one complimentary upgrade per stay if available. Never apply it twice.",
    "version": "sha256:1b4be5ea2f49"
  },
  {
    "id": "dining",
    "name": "harborline_dining_policy",
    "title": "Dinner reservation",
    "description": "Restaurant hours or booking a table for dinner.",
    "tools": [
      "get_outlet_hours",
      "book_restaurant"
    ],
    "content": "Check restaurant hours. Ask for date, time and party size before booking; report only the returned result.",
    "version": "sha256:ef5899c3ef74"
  },
  {
    "id": "checkout",
    "name": "harborline_checkout_policy",
    "title": "Late checkout",
    "description": "Request a later checkout for an existing room.",
    "tools": [
      "find_reservations",
      "check_departure_schedule",
      "update_checkout"
    ],
    "content": "First find reservations in this request, then check departure schedule, then update only if available.",
    "version": "sha256:1f677b8bda24"
  },
  {
    "id": "cancel",
    "name": "harborline_cancel_policy",
    "title": "Cancel a booking",
    "description": "Cancel an existing room or dinner booking.",
    "tools": [
      "find_reservations",
      "cancel_reservation"
    ],
    "content": "Find the requested reservation and obtain explicit confirmation before cancellation. Do not cancel another record.",
    "version": "sha256:faac1d8ed432"
  },
  {
    "id": "review",
    "name": "harborline_review_policy",
    "title": "Review a booking",
    "description": "Review or ask about current saved reservations and confirmation references.",
    "tools": [
      "find_reservations"
    ],
    "content": "Find reservations and answer from the returned records. Do not modify them.",
    "version": "sha256:2b1cd9288df7"
  },
  {
    "id": "general",
    "name": "harborline_general_policy",
    "title": "Guest help",
    "description": "Greetings, help, unsupported requests, or declining a proposed change.",
    "tools": [],
    "content": "Briefly help with supported hotel actions. Ask a clarifying question when needed. Do not claim unsupported actions were performed.",
    "version": "sha256:29ff1c2a0946"
  }
];
