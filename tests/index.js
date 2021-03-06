var test = require('tape');
var AmazonBot = require('../');

var testData = {
  login: {
    valid: {
      user: process.env.AMAZON_USER,
      pass: process.env.AMAZON_PASS
    },
    invalid: {
      user: 'invalid',
      pass: 'invalid'
    }
  },
  code: {
    invalid: 'invalid'
  }
}

test('Login with invalid credentials', function(t) {
  t.plan(2);

  var bot = new AmazonBot('de', true);
  bot
    .login(testData.login.invalid.user, testData.login.invalid.pass)
    .then(function() {}, function(err) { t.equals(err, 'Login failed', 'Login failed'); })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Cart functionality', function(t) {
  t.plan(22);

  var bot = new AmazonBot('de');
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.clearCart(); })
    .then(function() { t.ok(true, 'Cart empty'); })
    .then(function() { return bot.addItems(['B00B1ZSX4S', 'B00B1ZSXCA', 'B008MFXJCQ', 'B00DRYZC1S']); })
    .then(function() { t.ok(true, 'Added items'); })
    .then(function() { return bot.removeItems(['B00B1ZSX4S', 'B00B1ZSXCA']); })
    .then(function() { t.ok(true, 'Removed items'); })
    .then(function() { return bot.getCartTotal(); })
    .then(function(total) {
      t.equal(total.items, 2, 'Cart count');
      t.equal(total.currency, 'EUR', 'Cart currency');
      t.equal(total.price, 20.96, 'Cart price');
    })
    .then(function() { return bot.getCart(); })
    .then(function(cart) {
      t.equal(cart.total.items, 2, 'Cart count');
      t.equal(cart.total.currency, 'EUR', 'Cart currency');
      t.equal(cart.total.price, 20.96, 'Cart price');

      t.equal(cart.items.length, 2, 'Cart items');

      var item = cart.items[0];
      t.equal(item.id, 'B00DRYZC1S', 'Item ID');
      t.equal(item.title, 'Futurama - Season 7 [2 DVDs]', 'Item title');
      t.equal(item.link, 'https://amazon.de/gp/product/B00DRYZC1S', 'Item Link');
      t.equal(item.amount, 1, 'Item amount');
      t.equal(item.currency, 'EUR', 'Item currency');
      t.equal(item.price, 10.97, 'Item price');
    })
    .then(function() { return bot.getTotal(); })
    .then(function(total) {
      t.equals(total.items, 21.14, 'Items');
      t.equals(total.shipping, 0, 'Shipping');
      t.equals(total.total, 21.14, 'Total');
      t.equals(total.currency, 'EUR', 'Currency');
    })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); })
    .then(function() { return bot.close(); })
    .catch(function(err) {
      console.log('Rejected with reason:', err);
      bot.logout();
    });
});

test('Redeem invalid gift code', function(t) {
  t.plan(3);

  var bot = new AmazonBot('de', true);
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.redeem(testData.code.invalid); })
    .then(function() {}, function(err) { t.equals(err, 'Invalid gift code', 'Redeeming failed'); })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Check balance', function(t) {
  t.plan(3);

  var bot = new AmazonBot('de', true);
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.getBalance(); })
    .then(function(balance) {
      t.equals(balance, 0.00, 'Balance');
    })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});

test('Check addresses', function(t) {
  t.plan(6);

  var bot = new AmazonBot('de', true);
  bot
    .login(testData.login.valid.user, testData.login.valid.pass)
    .then(function() { t.ok(true, 'Login'); })
    .then(function() { return bot.getAddresses(); })
    .then(function(addresses) {
      var address = addresses[0];

      t.ok(address.name, 'Name');
      t.ok((address.address1 || address.address2), 'Address');
      t.ok(address.city, 'City');
      t.ok(address.country, 'Country');
    })
    .then(function() { return bot.logout(); })
    .then(function() { t.ok(true, 'Logout'); });
});
