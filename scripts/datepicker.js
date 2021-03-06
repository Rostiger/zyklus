'use strict'

function DatePicker () {
	let yearSelect, monthSelect, daySelect, previousDay, setDateButton, error
	let content

	this.start = function () {
		let html =
			`<form>
					<section class="datepicker">
						<span>
			        <label for="day"><h2>{{date-day}}</h2></label>
			        <select id="day" name="day"></select>
			      </span>
			      <span>
			        <label for="month"><h2>{{date-month}}</h2></label>
			        <select id="month" name="month">`
			        for (const month in months) {
			        	month === 0 ? html+= `<option selected>${months[month]}</option>` : html += `<option>${months[month]}</option>`
			        }
			        html +=
			        `</select>
		      	</span>
		      	<span>
		        	<label for="year"><h2>{{date-year}}</h2></label>
		        	<select id="year" name="year"></select>
		       	<span>
		    	</section>
		      <section id="error"></section>
		    	<section>
						<input id="setDateButton" type="button" value="{{date-select-button}}"></input>
	        </section>
				</form>`
		content = zyklus.interpreter.parse(html)
}

	this.open = function (id, value, min, max) {
		// add content to popup
		const header = zyklus.interpreter.parse("{{date-select-header}}")
		zyklus.interface.popup.open(header, content)

		this.populateFields()
		
		error.style.display = 'none'
		const date = value != 0 ? new Date(value) : min != 0 ? new Date(min) : new Date()
		this.setDate(date)
		setDateButton.onclick = function() { zyklus.interface.datePicker.pickDate(id, min, max) }
	}

	this.close = function () {
		zyklus.interface.popup.close()
	}

	this.pickDate = function (id, min, max) {
		const date = `${yearSelect.value}-${leadingZero(monthSelect.selectedIndex+1)}-${leadingZero(daySelect.value)}`
		const selected = new Date(date)
		if (min != 0) {
			this.min = new Date(min)
			if (this.min - selected >= 0) {
				this.displayError(0, min)
				return
			}
		} else if (max != 0) {
			this.max = new Date(max)
			if (this.max - timeStamp <= 0) {
				this.displayError(1, max)
				return
			}
		}
		id.value = date
		zyklus.getFormData(id)
		this.close()
	}
	
	this.populateFields = function() {	        	
		yearSelect = document.querySelector('#year')
		monthSelect = document.querySelector('#month')
		daySelect = document.querySelector('#day')
		setDateButton = document.querySelector('#setDateButton')
		error = document.querySelector('#error')

		yearSelect.onchange = function() { populateDays(monthSelect.selectedIndex) }
		monthSelect.onchange = function() { populateDays(monthSelect.selectedIndex) }
		daySelect.onchange = function() { previousDay = daySelect.value }
	  
	  populateDays(monthSelect.value)
	  populateYears()
	}

	const populateDays = function (month) {
	  while(daySelect.firstChild) daySelect.removeChild(daySelect.firstChild)

	  let dayNum

	  if (
	  	month === 0 || 
	  	month === 2 || 
	  	month === 4 || 
	  	month === 6 || 
	  	month === 7 || 
	  	month === 9 || 
	  	month === 11) dayNum = 31
	  else if (
	  	month === 3 || 
	  	month === 5 || 
	  	month === 8 || 
	  	month === 10) dayNum = 30
	  else {
	    const year = yearSelect.value
	    const isLeap = new Date(year, 1, 29).getMonth() == 1
	    isLeap ? dayNum = 29 : dayNum = 28
	  }

	  for (let i = 1; i <= dayNum; i++) {
	    const option = document.createElement('option')
	    option.textContent = i
	    daySelect.appendChild(option)
	  }

	  if (previousDay) {
	  	daySelect.value = previousDay

	    if(daySelect.value === "") daySelect.value = previousDay - 1
	    if(daySelect.value === "") daySelect.value = previousDay - 2
	    if(daySelect.value === "") daySelect.value = previousDay - 3
	  }
	}

	const populateYears = function () {
	  const date = new Date()
	  const year = date.getFullYear()

	  for(var i = 0; i <= 10; i++) {
	    const option = document.createElement('option')
	    option.textContent = year-i
	    yearSelect.appendChild(option)
	  }
	}

	this.dateButton = function (id, label, value, min, max) {
		let args = `${id}`
		args += value != undefined ? `, '${value}'` : ", 0"
		args += min != undefined ? `, '${min}'` : ", 0"
		args += max != undefined ? `, '${max}'` : ", 0"
		const button =
			`<form>
				<input type="button" id="${id}" value="${label}" onClick="zyklus.interface.datePicker.open(${args})" />
			</form>`
		return button
	}

	this.setDate = function (date) {
		daySelect.value = date.getDate()
		monthSelect.value = zyklus.interpreter.parse(months[date.getMonth()])
		yearSelect.value = date.getFullYear()
	}

	this.displayError = function (errorCode, date) {
		error.style.display = 'block'
		const preposition = errorCode < 1 ? '{{date-select-error-after}}' : '{{date-select-error-before}}'
		let html = `<span class="error">{{date-select-error}} ${preposition} ${prettyDate(date, true)}</span>`
		html = zyklus.interpreter.parse(html)
		error.innerHTML = html
	}
}