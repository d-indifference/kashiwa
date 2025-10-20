const fetchActualReports = userId => {
  const WARNING_SIGN = '⚠';
  const TICK_SIGN = '✔';
  const ERROR_SIGN = '✖';

  const reportsBtn = document.getElementById('reports-btn')
  const reportsBtnString = reportsBtn.innerHTML;

  fetch(`/api/v1/reports/exists?userId=${userId}`).then(response => {
    if (response.ok) {
      response.json().then(value => {
        const parsedValue = Boolean(value);

        if (parsedValue) {
          reportsBtn.innerHTML = `${reportsBtnString} ${WARNING_SIGN}`;
        } else {
          reportsBtn.innerHTML = `${reportsBtnString} ${TICK_SIGN}`;
        }
      });
    } else {
      console.log(response);
      reportsBtn.innerHTML = `${reportsBtnString} ${ERROR_SIGN}`;
    }
  });
};