let input = document.getElementById("input")
let ok = document.getElementById("ok")
let cancel = document.getElementById("cancel")
let result = 0;
let h1;
let h2;
let month;
ok.addEventListener("click", function(ev) {
    ev.preventDefault();
    if (input.value === '') {
        input.style.borderColor = "red";
        input.setAttribute("placeholder", "Enter you're age !")
    } else {
        result = 2022 - +input.value
        let ageMonth = +input.value * 12;
        
        
        //age in yers ________)
        h1 = document.createElement("h1")
        let text = document.createTextNode(`year increase: ${result}`)
        h1.append(text)
        h1.setAttribute("class", "output")

        document.forms[0].append(h1)

        document.body.appendChild(h1)
        if (input.value > 1000) {
            console.log("true");
        } else {
            //her age in month ________________
            month = document.createElement("h1")
            let textMonth = document.createTextNode(`you're age in month: ${ageMonth}`)
            month.append(textMonth)
            month.classList.add("output")
            document.body.appendChild(month)


            // her age in dayse _____
            h2 = document.createElement("h1")
            let result2 = +input.value * 365;
            let text2 = document.createTextNode(`you're age in days: ${result2}`)
            h2.append(text2)
            h2.setAttribute("class", "output")

            document.forms[0].append(h2)

            document.body.appendChild(h2)


            ok.onclick = function() {

                h1.remove()
                month.remove()
                document.body.appendChild(h1)
                document.body.appendChild(h2)
                document.body.appendChild(month)

            }


        }

    }

});


cancel.onclick = function() {
    //input.blur();
}


cancel.onclick = () => input.value = '';


// test
localStorage.setItem("age", "17")
