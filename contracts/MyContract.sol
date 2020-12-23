pragma solidity >=0.4.22 <0.9.0;

contract MyContract {
    
    address payable public owner;
    address payable public customer;
    address payable public courier;

  struct Shipment {
    address courier;
    string location;
    uint price;
    uint payment;
    address customer;
    uint date;
}

  struct Order {
    string product;
    uint quantity;
    uint id;
    uint price;
    uint payment;
    bool isDelivered;
    bool canPay;
    bool isPaid;
    Shipment shipment;
    bool init;
}

    event orderSent (address customer, string productName, uint quantity, uint orderID);
    event orderPriceSent (address customer, uint price, uint orderID);
    event shipmentPriceSent (address customer, uint price, uint orderID);
    event paymentSent (address customer, uint priceSent, uint when);
    event deliverySent (address courier, string location, uint when);

    mapping(uint => Order)  orders;
    uint numOfOrders;
    
    Shipment _shipment;
    Order _order ;
    
    constructor (address payable _customer, address payable _courier)  public{
        owner = msg.sender;
        customer = _customer;
        courier = _courier;
    }
    
    function sendOrder(string memory _product, uint _quantity, string memory _location) public {
        require(customer == msg.sender);
        numOfOrders++;
        _shipment.courier = courier;
        _shipment.location = _location;
        _shipment.customer = customer;
        
        _order.product = _product;
        _order.quantity = _quantity;
        _order.id = numOfOrders;
        _order.isDelivered = false;
        _order.canPay = false;
        _order.isPaid = false;
        _order.shipment = _shipment;
        _order.init = true;
        
        orders[numOfOrders] = _order;

        emit orderSent(customer, _product, _quantity, numOfOrders);
    }
    
    function sendOrderPrice(uint _orderID, uint _price) public {
        require(owner == msg.sender);
        require(orders[_orderID].init);
        orders[_orderID].price = _price;

        emit orderPriceSent(customer, _price, _orderID);
    }
    
    function sendShipmentPrice(uint _orderID, uint _price) public {
        require(owner == msg.sender);
        require(orders[_orderID].init);
        orders[_orderID].shipment.price = _price;

        emit shipmentPriceSent(customer, _price, _orderID);
    }
    
    // owner allows customer to pay when prices are set
    function allowCustomerToPay(uint _orderID) public {
        require(owner == msg.sender);
        require(orders[_orderID].init);
        orders[_orderID].canPay = true;
    }
    
    // customer sends payment
    function sendPayment(uint _orderID) public payable {
        require(customer == msg.sender);
        require(orders[_orderID].init);
        require(orders[_orderID].canPay);
        require(orders[_orderID].price + orders[_orderID].shipment.price == msg.value);
        
        orders[_orderID].payment = orders[_orderID].price;
        orders[_orderID].shipment.payment = orders[_orderID].shipment.price;
        orders[_orderID].isPaid = true;
        
        emit paymentSent(customer, msg.value, now);
    }
    
    // this function is called by courier when order is delivered
    function orderDelivered(uint _orderID) public payable{
        // only courier can call this function
        require(courier == msg.sender);
        require(orders[_orderID].init);
        
        orders[_orderID].shipment.date = now;
        owner.transfer(orders[_orderID].payment);
        courier.transfer(orders[_orderID].shipment.payment);
        
        emit deliverySent(courier, orders[_orderID].shipment.location, now);
    }
    
    function getOrderInfo(uint _orderID) 
    view public returns 
    (
        address _customer, 
        string memory _product, 
        uint _quantity, 
        uint _price, 
        bool _isPaid, 
        bool _canBePaid
    )
    {
        require(orders[_orderID].init);
        return(customer, orders[_orderID].product, orders[_orderID].quantity, orders[_orderID].price, orders[_orderID].isPaid, orders[_orderID].canPay);
    }
    
    function getShippmentInfo(uint _orderID) 
    view public returns 
    (
        address _courier, 
        string memory _location, 
        uint _price, 
        uint _dateOfDelivery
    ) 
    {
        require(orders[_orderID].init);
        return(courier, orders[_orderID].shipment.location, orders[_orderID].shipment.price, orders[_orderID].shipment.date);
    }
    
}