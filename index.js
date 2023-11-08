

let key = 'b4c5704e16f64f039dc130347230711';

let temperatureMain = document.querySelector(".large-temp");
let locations = document.querySelectorAll(".locations");
let windSpeed = document.getElementById("windSpeed");
let humidity = document.getElementById("humidity");
let feelsLike = document.getElementById("feelsLike");
let uv = document.getElementById("uv");
let aqi = document.getElementById("aqi");
let weatherText = document.getElementById("weather-text");
let icon = document.querySelector(".icon");
let time = document.getElementById("time");
let hourlyForecastsContainer = document.getElementById("hourly-forecasts-container");
let daysForecastsContainer = document.getElementById("daysForecastContainer");
// let meridiem = document.getElementById("meridiem");
let search = document.getElementById("location-input");

function convertTime(hours, minutes) {

    let text = "AM";
    // checking the meridiem
    if (hours == 0 || hours < 12) {
        text  = "AM"
    }
    else {
        text = "PM"
    }
    // converts 24 hrs time to display in 12hrs format
    if (hours == 0) {
        hours = 12
    }
    else if (hours > 12) {
        hours -= 12
    }
    
    // adds zero before digits
    if (hours < 10)
    {
        hours = addZero(hours);    
    }
    
    if (minutes != undefined) {
        
        if (minutes < 10) {
        
            minutes = addZero(minutes);
        }

        return {
            hour: hours,
            minute: minutes,
            meridiem : text
        }
    }

    return {
        hour: hours,
        meridiem : text
    }

}
function getTime() {

    const t = new Date();
    let presentHour = t.getHours();
    let presentMin = t.getMinutes();
    let time = convertTime(presentHour, presentMin)
    let timetext =  `${time.hour}:${time.minute}`   
    time.innerText = timetext;
    // meridiem.innerText = time.meridiem;
}

// adds zero to the value passed
function addZero(text) {

    text = "0" + text;
    return text;
}

getTime();

// updates time every second
setInterval(() => {
    
    getTime();

}, 1000);


// adds current temperature to DOM
function updateTemp(temperature) {
    temperatureMain.textContent = temperature;
}

// updates location 
function updateLocation(area) {
    for (let location of locations) {
        location.textContent = area;
    }
}

// updates all the additional info 
function updateAdditionalInfo(weather) {
    
    let iconurl = weather.current.condition.icon;
    windSpeed.textContent = weather.current.wind_kph;
    humidity.textContent = weather.current.humidity;
    feelsLike.textContent = weather.current.feelslike_c;
    uv.textContent = weather.current.uv;
    aqi.textContent = weather.current.air_quality['us-epa-index'];
    weatherText.textContent = weather.current.condition.text;
    icon.src = `https:${iconurl}`;
}

//updates hourly forecasts
function updateHourly(hourData) {
    
    hourlyForecastsContainer.innerHTML = "";
    for (let hour of hourData) {
        
        let timeHour = new Date(hour.time).getHours();
        let formattedTime = convertTime(timeHour);
        let div = document.createElement('div');
        div.classList.add("forecasts-hr")
        div.innerHTML = `
            <p class="hours">${formattedTime.hour} ${formattedTime.meridiem}</p>
            <p class="temp md-temp">${hour.temp_c}</p>
        `
        hourlyForecastsContainer.appendChild(div);
    }

}

// adds daily forecast to DOM
function updateDays(dayForecasts) {
    daysForecastsContainer.innerHTML = "";
    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    for (let dayForecast of dayForecasts) {
        let daysAvgTemp = dayForecast.day.avgtemp_c;
        let day = new Date(dayForecast.date).getDay();
        let todaysDay = new Date().getDay();
        if (day == todaysDay) {
            day = "Today"
        }
        else {
            day = days[day]
        }
        let tableRow = document.createElement('tr');
        tableRow.classList.add("cards-table-row")
        tableRow.innerHTML = `
            <td><p class="table-text">${day}</p></td>
            <td><p class="table-text avg-temp" >${daysAvgTemp}</p></td>
        `
        daysForecastsContainer.appendChild(tableRow);
    }

}

function getTodaysDate() {
    let currentDate = new Date()
    let date = currentDate.getDate();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    if (date < 10) {
        date = addZero(date);
    }
    if (month < 10) {
        month = addZero(month)
    }

    return `${year}-${month + 1}-${date}`
    
}
// calls api for forecast information
async function fetchForecast(location) {
    let url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${location}&days=7&aqi=yes&alerts=no`
    let forecast = await fetch(url).then(res => res.json());
    return forecast;
}

async function updateDOM(location) {

    // let currentWeather = await fetchCurrentData(location);
    let forecastWeather = await fetchForecast(location);
    if ('error' in forecastWeather) {   
        window.alert("Please enter valid location");
        return;
    }
    else {
        let currentTemp = forecastWeather.current.temp_c;
        let hourlyForecasts = forecastWeather.forecast.forecastday;
        let todaysDate = getTodaysDate();
        let todaysHourlyForecasts = hourlyForecasts.find((forecast) => forecast.date == todaysDate);
        await updateTemp(currentTemp)
        await updateLocation(forecastWeather.location.name);
        await updateAdditionalInfo(forecastWeather);
        await updateHourly(todaysHourlyForecasts.hour)
        await updateDays(forecastWeather.forecast.forecastday)
    }

}


search.addEventListener('keydown', (e) => {

    if (e.code == "Enter") {
        let searchLocation = search.value;
        search.value = "";
        updateDOM(searchLocation);
    }

})


updateDOM("hyderabad");

