const toCurrency = (price) => { //function for format price
  return new Intl.NumberFormat("en-US", {
    currency: "usd",
    style: "currency",
  }).format(price);
};

const toDate = (date) => { //function for format date
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(date));
};

document.querySelectorAll(".date").forEach((node) => { //get all elements with class date
  node.textContent = toDate(node.textContent); //format date
});

document.querySelectorAll(".price").forEach((node) => { //get all elements with class price
  node.textContent = toCurrency(node.textContent); //format price
});

const $card = document.querySelector("#card"); // get card element
if ($card) { // if card element exists
  $card.addEventListener("click", (event) => { // add event listener
    if (event.target.classList.contains("js-remove")) { // if click on element with class js-remove
      const id = event.target.dataset.id; // get id from element
      const csrf = event.target.dataset.csrf; // get csrf from element

      fetch("/card/remove/" + id, {
        method: "delete",
        headers: { "X-XSRF-TOKEN": csrf },
      })
        .then((res) => res.json()) // get response
        .then((card) => { // get card
          if(card.courses.length) {
            const html = card.courses.map((c) => {
              return `
                <tr>
                  <td>${c.title}</td>
                  <td>${c.count}</td>
                  <td>
                    <button class="btn btn-small js-remove" data-id="${c.id}">Delete</button>
                  </td>
                </tr>
              `;
            }).join('');
            $card.querySelector('tbody').innerHTML = html; // render card
            $card.querySelector('.price').textContent = toCurrency(card.price); // render price
          } else {
            $card.innerHTML = '<p>Card is empty</p>';
          } 
        });
    }
  });
}

M.Tabs.init(document.querySelectorAll(".tabs")); //initialize tabs from materialize
