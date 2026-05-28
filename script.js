function parseCurrency(value){

  if(!value) return 0;

  value = value
    .toString()
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return parseFloat(value) || 0;
}

function formatCurrency(value){

  return Number(value).toLocaleString("pt-PT", {
    style:"currency",
    currency:"EUR"
  });
}

function setupMoneyInputs(){

  const inputs = document.querySelectorAll(
    ".money-input, .income-input"
  );

  inputs.forEach(input => {

    if(input.dataset.ready) return;

    input.dataset.ready = true;

    // DIGITAR LIVREMENTE
    input.addEventListener("focus", () => {

      let value = parseCurrency(input.value);

      if(value > 0){

        input.value =
          value.toString()
            .replace(".", ",");

      }else{

        input.value = "";

      }

    });

    // ATUALIZA EM TEMPO REAL
    input.addEventListener("input", () => {

      updateTotals();

      saveData();

    });

    // FORMATA APENAS AO SAIR
    input.addEventListener("blur", () => {

      const value =
        parseCurrency(input.value);

      if(value > 0){

        input.value =
          formatCurrency(value);

      }else{

        input.value = "";

      }

      updateTotals();

      saveData();

    });

    // ENTER NO CELULAR
    input.addEventListener("keydown", (e) => {

      if(e.key === "Enter"){

        e.preventDefault();

        input.blur();

      }

    });

  });

}

function populateMonthSelector(){

  const select =
    document.getElementById("summaryMonth");

  const current = select.value;

  select.innerHTML = "";

  document.querySelectorAll("#headerRow th")
    .forEach((th, index) => {

      if(index < 2) return;

      const option =
        document.createElement("option");

      option.value = index - 2;
      option.textContent = th.innerText;

      select.appendChild(option);

    });

  select.value = current || 0;
}
function createDefaultMonth(monthName){

  const th = document.createElement("th");

  th.innerText = monthName;

  document.getElementById("headerRow")
    .appendChild(th);

  const totalTd = document.createElement("td");

  totalTd.classList.add("month-total");

  totalTd.innerText = "€ 0,00";

  document.getElementById("totalRow")
    .appendChild(totalTd);

  populateMonthSelector();

}


function addMonth(){

  const monthName =
    prompt("Nome do mês:");

  if(!monthName) return;

  const th = document.createElement("th");

  th.innerText = monthName;

  document.getElementById("headerRow")
    .appendChild(th);

  const totalTd = document.createElement("td");

  totalTd.classList.add("month-total");

  totalTd.innerText = "€ 0,00";

  document.getElementById("totalRow")
    .appendChild(totalTd);

  document.querySelectorAll("#servicesBody tr")
    .forEach(row => {

      const td = document.createElement("td");

      td.innerHTML = `
        <input
          type="text"
          class="money-input"
          inputmode="decimal"
          placeholder="0,00"
        >
      `;

      row.appendChild(td);

    });

  populateMonthSelector();

  setupMoneyInputs();

  updateTotals();

  saveData();
}

function addService(){

  const tbody =
    document.getElementById("servicesBody");

  const headers =
    document.querySelectorAll("#headerRow th");

  const row = document.createElement("tr");

  let html = `
    <td>

      <input
        type="text"
        placeholder="Serviço">

      <button
        class="delete-btn"
        onclick="removeRow(this)">
        Remover
      </button>

    </td>

    <td>

      <select onchange="saveData()">

        <option>Willian</option>
        <option>Duda</option>
        <option>Ambos</option>

      </select>

    </td>
  `;

  for(let i = 2; i < headers.length; i++){

    html += `
      <td>

        <input
          type="text"
          class="money-input"
          inputmode="decimal"
          placeholder="0,00"
        >

      </td>
    `;
  }

  row.innerHTML = html;

  tbody.appendChild(row);

  setupMoneyInputs();

  saveData();
}

function addIncome(){

  const tbody =
    document.getElementById("incomeBody");

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>

      <input
        type="text"
        placeholder="Receita">

      <button
        class="delete-btn"
        onclick="removeRow(this)">
        Remover
      </button>

    </td>

    <td>

      <select onchange="saveData()">

        <option>Willian</option>
        <option>Duda</option>

      </select>

    </td>

    <td>

      <input
        type="text"
        class="income-input"
        inputmode="decimal"
        placeholder="0,00"
      >

    </td>
  `;

  tbody.appendChild(row);

  setupMoneyInputs();

  saveData();
}

function removeRow(btn){

  btn.closest("tr").remove();

  updateTotals();

  saveData();
}

function updateTotals(){

  const selectedMonth = Number(
    document.getElementById("summaryMonth")
    ?.value || 0
  );

  let totalPay = 0;
  let totalReceive = 0;

  const monthTotals = [];

  document.querySelectorAll("#servicesBody tr")
    .forEach(row => {

      const inputs =
        row.querySelectorAll(".money-input");

      inputs.forEach((input, index) => {

        const value =
          parseCurrency(input.value);

        if(!monthTotals[index]){
          monthTotals[index] = 0;
        }

        monthTotals[index] += value;

        if(index === selectedMonth){
          totalPay += value;
        }

      });

    });

  document.querySelectorAll(".month-total")
    .forEach((cell, index) => {

      cell.innerText =
        formatCurrency(monthTotals[index] || 0);

    });

  document.querySelectorAll("#incomeBody tr")
    .forEach(row => {

      totalReceive += parseCurrency(
        row.querySelector(".income-input").value
      );

    });

  const balance =
    totalReceive - totalPay;

  document.getElementById("totalToPay")
    .innerText =
      formatCurrency(totalPay);

  document.getElementById("totalToReceive")
    .innerText =
      formatCurrency(totalReceive);

  const balanceElement =
    document.getElementById("monthBalance");

  balanceElement.innerText =
    formatCurrency(balance);

  balanceElement.classList.remove(
    "balance-positive",
    "balance-negative"
  );

  balanceElement.classList.add(
    balance >= 0
      ? "balance-positive"
      : "balance-negative"
  );
}

function saveData(){

  const data = {
    months: [],
    services: [],
    incomes: []
  };

  document.querySelectorAll("#headerRow th")
    .forEach((th, index) => {

      if(index >= 2){
        data.months.push(th.innerText);
      }

    });

  document.querySelectorAll("#servicesBody tr")
    .forEach(row => {

      data.services.push({

        name:
          row.querySelector("td:first-child input").value,

        responsible:
          row.querySelector("select").value,

        values:
          [...row.querySelectorAll(".money-input")]
          .map(i => i.value)

      });

    });

  document.querySelectorAll("#incomeBody tr")
    .forEach(row => {

      data.incomes.push({

        name:
          row.querySelector("td:first-child input").value,

        responsible:
          row.querySelector("select").value,

        value:
          row.querySelector(".income-input").value

      });

    });

  localStorage.setItem(
    "finance_system",
    JSON.stringify(data)
  );
}

function loadData(){

  const saved =
    localStorage.getItem("finance_system");

  if(!saved) return;

  const data = JSON.parse(saved);

  data.months.forEach(month => {

    const th = document.createElement("th");

    th.innerText = month;

    document.getElementById("headerRow")
      .appendChild(th);

    const td = document.createElement("td");

    td.classList.add("month-total");

    td.innerText = "€ 0,00";

    document.getElementById("totalRow")
      .appendChild(td);

  });

  data.services.forEach(service => {

    const row = document.createElement("tr");

    let html = `
      <td>

        <input
          type="text"
          value="${service.name}">

        <button
          class="delete-btn"
          onclick="removeRow(this)">
          Remover
        </button>

      </td>

      <td>

        <select onchange="saveData()">

          <option
            ${service.responsible === "Willian" ? "selected" : ""}>
            Willian
          </option>

          <option
            ${service.responsible === "Duda" ? "selected" : ""}>
            Duda
          </option>

          <option
            ${service.responsible === "Ambos" ? "selected" : ""}>
            Ambos
          </option>

        </select>

      </td>
    `;

    service.values.forEach(value => {

      html += `
        <td>

          <input
            type="text"
            class="money-input"
            inputmode="decimal"
            value="${value}"
          >

        </td>
      `;

    });

    row.innerHTML = html;

    document.getElementById("servicesBody")
      .appendChild(row);

  });

  data.incomes.forEach(income => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>

        <input
          type="text"
          value="${income.name}">

        <button
          class="delete-btn"
          onclick="removeRow(this)">
          Remover
        </button>

      </td>

      <td>

        <select onchange="saveData()">

          <option
            ${income.responsible === "Willian" ? "selected" : ""}>
            Willian
          </option>

          <option
            ${income.responsible === "Duda" ? "selected" : ""}>
            Duda
          </option>

        </select>

      </td>

      <td>

        <input
          type="text"
          class="income-input"
          inputmode="decimal"
          value="${income.value}"
        >

      </td>
    `;

    document.getElementById("incomeBody")
      .appendChild(row);

  });

  populateMonthSelector();

  setupMoneyInputs();

  updateTotals();
}

document.addEventListener("DOMContentLoaded", () => {

  loadData();

  // Se estiver vazio
  const hasMonths =
    document.querySelectorAll("#headerRow th").length > 2;

  const hasServices =
    document.querySelectorAll("#servicesBody tr").length > 0;

  // Cria primeiro mês automaticamente
  if(!hasMonths){

    createDefaultMonth("Janeiro");

  }

  // Cria primeiro serviço automaticamente
  if(!hasServices){

    addService();

  }

  setupMoneyInputs();

  document.getElementById("summaryMonth")
    .addEventListener("change", updateTotals);

  updateTotals();

});