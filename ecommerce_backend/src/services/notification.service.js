'use strict'

const { Noti } = require("../models/notification.model")

class NotificationService {
  static async pushNotiToSystem({
    type = 'SHOP-001',
    receivedId = 1,
    senderId = 1,
    options = {}
  }) {
    let noti_content

    if (type === 'SHOP-001') {
      noti_content = `@@@ just add a new product @@@@`
    } else if (type === 'PROMOTION-001') {
      noti_content = `@@@ just add a new voucher @@@@`
    }

    const newNoti = await Noti.create({
      noti_type: type,
      noti_content: noti_content,
      noti_senderId: senderId,
      noti_receivedId: receivedId,
      noti_options: options
    })

    return newNoti
  }

  static async listNotiByUser ({
    userId = 1,
    type = 'ALL',
    isRead = 0
  }) {
    // const match = { noti_receivedId: userId }
    if (type !== 'ALL') {
      match['noti_type'] = type
    }

    return await Noti.aggregate([
      // { $match: match },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_receivedId: 1,
          noti_content: {
            $concat: [
              {
                $substr: ['$noti_options.shop_name', 0, -1]
              },
              ' just add a new product: ',
              {
                $substr: ['$noti_options.product_name', 0, -1]
              }
            ]
          },
          createdAt: 1,
          noti_options: 1
        }
      }
    ])
  }
}

module.exports = NotificationService