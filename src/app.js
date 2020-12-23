App = {
    loading: false,
    contracts: {},
    load: async () => {
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadContract()
        await App.render()
    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider
          web3 = new Web3(web3.currentProvider)
        } else {
          window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
          } catch (error) {
            // User denied account access...
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          App.web3Provider = web3.currentProvider
          window.web3 = new Web3(web3.currentProvider)
          // Acccounts always exposed
          web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      },

      loadAccount: async () => {
          App.account = web3.eth.accounts[0]      
        },

      loadContract: async () => {
          const myContract = await $.getJSON('MyContract.json')
          App.contracts.MyContract = TruffleContract(myContract)
          App.contracts.MyContract.setProvider(App.web3Provider)

          App.myContract = await App.contracts.MyContract.deployed()
      },

      

      render: async () => {
          // if (App.loading) {
          //     return
          // }

          // //update app loading state
          // App.setLoading(true)
          //render account
        $('#account').html(App.account)

        await App.renderOrder()
        await App.renderAddresses()

        // update loading state
        // App.setLoading(false)
      },

      sendOrder: async () => {
        const productName = $('#productName').val()
        const productQuantity = $('#productQuantity').val()
        const productLocation = $('#productLocation').val()
        await App.myContract.sendOrder(productName, productQuantity, productLocation)
      },

      sendOrderPrice: async () => {
        const orderPrice = $('#orderPrice').val()
        const orderID = $('#1_orderID').val()
        await App.myContract.sendOrderPrice(orderID, orderPrice)
      },
      
      sendShipmentPrice: async () => {
        const shipmentPrice = $('#shipmentPrice').val()
        const orderID = $('#2_orderID').val()
        await App.myContract.sendShipmentPrice(orderID, shipmentPrice)
      },

      allowCustomerToPay: async () => {
        const orderID = $('#3_orderID').val()
        await App.myContract.allowCustomerToPay(orderID)
      },

      sendPayment: async () => {
          const orderID = $('#4_orderID').val()
          await App.myContract.sendPayment(orderID)
      },

      orderDelivered: async () => {
          const orderID = $('#5_orderID').val()
          await App.myContract.orderDelivered(orderID)
      },

      updateOrderInfo: async () => {
        await App.renderOrder()
        await App.renderAddresses()
      },

      renderOrder: async () => {
        const orderInfo = await App.myContract.getOrderInfo(1)
        $('#_productID').html(orderInfo[1])
        $('#_quantity').html(orderInfo[2].c[0])
        $('#_price').html(orderInfo[3].c[0])
        $('#_isPaid').html(orderInfo[4].toString())
        $('#_canBePaid').html(orderInfo[5].toString())
        console.log(orderInfo[5])
      },

      renderAddresses: async () => {
          const ownerAddress = await App.myContract.owner();
          const customerAddress = await App.myContract.customer();
          const courierAddress = await App.myContract.courier();
          $('#ownerAddress').html(ownerAddress)
          $('#customerAddress').html(customerAddress)
          $('#courierAddress').html(courierAddress)
      },

      // setLoading: (boolean) => {
      //   App.loading = boolean
      //   const loader = $('#loader')
      //   const content = $('#content')
      //   if (boolean) {
      //     loader.show()
      //     content.hide()
      //   } else {
      //     loader.hide()
      //     content.show()
      //   }
      // }
}

$(() => {
    $(window).load(() => {
        App.load()
    })
})