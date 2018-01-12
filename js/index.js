const SK_API_URL = "http://apis.skplanetx.com";
initMap();

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      getLocationWeather("hour", pos.lat, pos.lng, currentNowWeather);
      getLocationWeather("12hour", pos.lat, pos.lng, forecastGoToAndLeave);
      getLocationName(pos.lat, pos.lng);
      getShoppingList(Math.floor(Math.random() * 7));
    }, function() {
      console.log("Error Occured.");
    });
  } else {
    // Browser doesn't support Geolocation
    console.log("Error Occured.");
  }
}

async function getLocationName(lat, lon) {
  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=AIzaSyD1FyInkZsYpB9BgEXJ-APIF7PEuJW1f-k`);
  const location = await res.json();
  let locationName = "";
  for (let item of location.results) {
    if (item.address_components.length > 4 && item.types.length === 3) {
      locationName = "";
      for (let i = 2; i >= 0; i--) {
        locationName += item.address_components[i].long_name + " ";
      }
    }
  }
  const dongEl = document.querySelector('.dong');
  dongEl.textContent = locationName;
  //   console.log(locationName);
}

function currentNowWeather(result) {
  const curWeather = result.weather.hourly[0];
  const skyImg = document.querySelector('.weather-img');
  let stateName = "";
  for (let i = 1; i < 15; i++) {
    stateName = "SKY_O";
    stateName = (i < 10) ? stateName + "0" + i : stateName + i;
    console.log(curWeather.sky.code, stateName);
    if (curWeather.sky.code === stateName) {
      //   skyImg.setAttribute("src", "image/" + stateName + ".png");
      skyImg.setAttribute("src", "image/SKY_O01.png");
      break;
    }
  }
  curWeather.sky.code; //날씨코드
  const skyState = document.querySelector('.weather-state');
  skyState.textContent = curWeather.sky.name; //맑음
  const temper = document.querySelector('.degree');
  temper.textContent = curWeather.temperature.tc; //온도
  const timeRelease = document.querySelector('.curr-time-value');
  timeRelease.textContent = curWeather.timeRelease; //업데이트시간
  const precipitation = document.querySelector('.precipitation');
  precipitation.textContent = curWeather.precipitation.sinceOntime; //강수량
}

function forecastGoToAndLeave(result) {
  const foreWeather = result.weather.forecast6days[0];
  const ret = {};
  for (let i = 2; i < 4; i++) {
    //goDay1, goDay2 출근 첫째날, 둘째날
    ret["goDay" + (i - 1)] = {
        "code": foreWeather.sky["amCode" + i + "day"],
        "state": foreWeather.sky["amName" + i + "day"],
        "temp": foreWeather.temperature["tmin" + i + "day"]
      }
      //leaveDay1, leaveDay2 퇴근 첫째날, 둘째날
    ret["leaveDay" + (i - 1)] = {
      "code": foreWeather.sky["pmCode" + i + "day"],
      "state": foreWeather.sky["pmName" + i + "day"],
      "temp": foreWeather.temperature["tmax" + i + "day"]
    }
  }
  console.log(ret);
}

function getLocationWeather(type, lat, lon, callback) {
  let scope = "";
  switch (type) {
    case "minute":
      scope = "current/minutely";
      break;
    case "hour":
      scope = "current/hourly";
      break;
    case "3hour":
      scope = "forecast/3days";
      break;
    case "12hour":
      scope = "forecast/6days";
      break;
  }
  //   http: //apis.skplanetx.com/weather/current/minutely?version={version}&lat={lat}&lon={lon}&city={city}&county={county}&village={village}&stnid={stnid}
  PlanetX.api("get", `${SK_API_URL}/weather/${scope}`, "JSON", {
    "version": 1,
    "lat": lat,
    "lon": lon
  }, function(r) {
    if (r.result.code === 9200) {
      callback(r);
    } else {
      throw new Error(e);
    }
  }, function(e) {
    throw new Error(e);
  });
}

function getShoppingList(idx) {
  const keywords = ["커피", "안전시설용품", "여행", "화장품", "영양제", "방한", "롱패딩"];
  console.log(keywords[idx]);
  PlanetX.api("get", `${SK_API_URL}/11st/common/products`, "JSON", {
    "version": 1,
    "page": 1,
    "count": 10,
    "searchKeyword": keywords[idx],
    "sortCode": "CP"
  }, function(r) {
    const resutPArr = r.ProductSearchResponse.Products.Product;
    const productArr = [];
    for (let item of resutPArr) {
      let newItem = {};
      newItem.name = item.ProductName;
      newItem.price = item.ProductPrice;
      newItem.saleprice = item.SalePrice;
      newItem.image = item.ProductImage;
      newItem.delivery = item.Delivery;
      newItem.link = item.DetailPageUrl;
      productArr.push(newItem);
    }
    console.log(productArr);
  }, function(e) {
    throw new Error(e);
  });
}