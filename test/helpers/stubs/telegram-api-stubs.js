module.exports = {
  commands: {
    start: {
      "update_id": 141822734,
      "message": {
        "message_id": 16,
        "from": {
          "id": 97633461,
          "first_name": "Mathis",
          "username": "Mathis_Fahrradflucht"
        },
        "chat": {
          "id": 97633461,
          "first_name": "Mathis",
          "username": "Mathis_Fahrradflucht",
          "type": "private"
        },
        "date": 1465556802,
        "text": "/start",
        "entities": [{
          "type": "bot_command",
          "offset": 0,
          "length": 6
        }]
      }
    },
    subscribe: {
      withArg: {
        "update_id": 807061712,
        "message": {
          "message_id": 3,
          "from": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht"
          },
          "chat": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht",
            "type": "private"
          },
          "date": 1465591070,
          "text": "/subscribe @homer",
          "entities": [{
              "type": "bot_command",
              "offset": 0,
              "length": 10
            },
            {
              "type": "mention",
              "offset": 11,
              "length": 6
            }
          ]
        }
      },
      withoutArg: {
        "update_id": 807061713,
        "message": {
          "message_id": 4,
          "from": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht"
          },
          "chat": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht",
            "type": "private"
          },
          "date": 1465671715,
          "text": "/subscribe",
          "entities": [{
            "type": "bot_command",
            "offset": 0,
            "length": 10
          }]
        }
      }
    }
  },
  dialogs: {
    subscribe: {
      plainName: {
        "update_id": 807061716,
        "message": {
          "message_id": 10,
          "from": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht"
          },
          "chat": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht",
            "type": "private"
          },
          "date": 1465738612,
          "text": "homer"
        }
      },
      mention: {
        "update_id": 807061715,
        "message": {
          "message_id": 9,
          "from": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht"
          },
          "chat": {
            "id": 97633461,
            "first_name": "Mathis",
            "username": "Mathis_Fahrradflucht",
            "type": "private"
          },
          "date": 1465738607,
          "text": "@homer",
          "entities": [{
            "type": "mention",
            "offset": 0,
            "length": 6
          }]
        }
      }
    }
  }
}
