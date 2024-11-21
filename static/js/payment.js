function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const regex = /([^&=]+)=([^&]*)/g;
  let match;
  while ((match = regex.exec(queryString))) {
    params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return params;
}

// Get the parameters and display them
const queryParams = getQueryParams();
document.getElementById('selectedDate').textContent = queryParams.date || 'N/A';
document.getElementById('selectedParkId').textContent = queryParams.parkId || 'N/A';
document.getElementById('durationDisplay').textContent = queryParams.duration === 'full' ? 'Full Day' : 'Half Day';

// Handle payment method selection
document.getElementById('paymentMethod').addEventListener('change', function () {
  const selectedMethod = this.value;
  document.querySelectorAll('.payment-option').forEach((option) => {
    option.style.display = 'none'; // Hide all options
  });
  if (selectedMethod) {
    document.getElementById(selectedMethod).style.display = 'block'; // Show selected option
  }
});

// Handle form submission for credit card
document.getElementById('paymentForm')?.addEventListener('submit', (event) => {
  event.preventDefault();
  // Here you can handle credit card payment processing
  alert('Payment processed for booking on ' + queryParams.date + ' for parking spot ID ' + queryParams.parkId);
});

// Handle button click for Alipay
document.getElementById('alipayDone')?.addEventListener('click', () => {
  alert('Alipay payment confirmed for booking on ' + queryParams.date + ' for parking spot ID ' + queryParams.parkId);
  // 这里可以添加进一步的处理逻辑，例如更新数据库状态
});

// Handle button click for WeChat
document.getElementById('wechatDone')?.addEventListener('click', () => {
  alert('WeChat payment confirmed for booking on ' + queryParams.date + ' for parking spot ID ' + queryParams.parkId);
  // 这里可以添加进一步的处理逻辑，例如更新数据库状态
});
