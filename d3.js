window.onload = scaleBody(); 

window.addEventListener("resize", scaleBody); 

function scaleBody() {
  let body = d3.select("body");
  if (window.innerWidth<1200){
    body.style("transform", "scale(" + window.innerWidth / 1200 + ")")
    .style("transform-origin", "0 0");
    
  } else {
    body.style("transform", "scale(1)");
  }
}

//CREATE ALL THE HTML

d3
  .select("body")
  .append("div")
  .attr("class", "main");

d3
  .select(".main")
  .append("div")
  .attr("id", "container");

d3
  .select("#container")
  .append("div")
  .attr("id", "title")
  .html("United States Educational Attainment");

d3
  .select("#container")
  .append("div")
  .attr("id", "description")
  .html(
    "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
  );

d3
  .select("#container")
  .append("div")
  .attr("id", "legend");

//CREATE CANVAS

const svg = d3
  .select("#container")
  .append("svg")
  .attr("height", 600)
  .attr("width", "auto");

//URL'S AND JSON GET REQUESTS

const EDUCATION_FILE =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";
const COUNTY_FILE =
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";

d3
  .queue()
  .defer(d3.json, COUNTY_FILE)
  .defer(d3.json, EDUCATION_FILE)
  .await(allTheStuff);

//ALL THE STUFF USING JSON FILES

function allTheStuff(error, us, education) {
  if (error) throw error;

  let educationArray = [];
  for (let i in education) {
    educationArray.push(education[i].bachelorsOrHigher);
  }
  let maxEd = d3.max(educationArray);
  let minEd = d3.min(educationArray);

  let edStep = Math.round((maxEd - minEd) / 9);
  let edScale = [];
  for (let i = Math.round(minEd + edStep); i <= maxEd; i += edStep) {
    edScale.push(i - 1);
  }

  const color = d3.schemeBlues[9];

  function colorSelect(x) {
    for (let i = 0; i < 9; i++) {
      if (x <= edScale[i]) {
        return color[i];
      }
    }
  }

  //RANDOM COUNTY BUTTON

  d3
    .select("#container")
    .append("div")
    .attr("id", "randomButton")
    .text("Random County")
    .on("click", randomness);

  function randomness() {
    let randomId =
      us.objects.counties.geometries[
        Math.floor(Math.random() * education.length)
      ].id;

    let randomCounty = document.querySelector(`.county[data-id="${randomId}"]`);
    let countyD = randomCounty.getAttribute("d");
    let x = Number(countyD.split(/[M,.]/)[1]);
    let y = Number(countyD.split(/[M,.]/)[3]);

    let d3RandomCounty = d3.select(`.county[data-id="${randomId}"]`);
    d3RandomCounty.style("fill", "red");

    d3
      .select("#tooltip")
      .style("visibility", "visible")
      .style("transform", `translate(${x + 120}px, ${y + 130}px)`)
      .style("top", "0px")
      .style("left", "0px")
      .html(function() {
        let county = education.filter(x => x.fips == randomId);
        return `${
          county[0].area_name
        }, ${county[0].state}</br>${county[0].bachelorsOrHigher}%`;
      });
  }

  //SMARTEST AND DUMBEST COUNTY BUTTONS

  function maxSelect() {
    let maxCounty = d3.select(`.county[data-education="${maxEd}"]`);
    maxCounty.style("fill", "red");

    let maxDOMCounty = document.querySelector(
      `.county[data-education="${maxEd}"]`
    );
    let countyD = maxDOMCounty.getAttribute("d");
    let countyFips = maxDOMCounty.getAttribute("data-id");
    let x = Number(countyD.split(/[M,.]/)[1]);
    let y = Number(countyD.split(/[M,.]/)[3]);

    d3
      .select("#tooltip")
      .style("visibility", "visible")
      .style("transform", `translate(${x + 120}px, ${y + 130}px)`)
      .style("top", "0px")
      .style("left", "0px")
      .html(function() {
        let county = education.filter(x => x.fips == countyFips);
        return `${
          county[0].area_name
        }, ${county[0].state}</br>${county[0].bachelorsOrHigher}%`;
      });
  }

  function minSelect() {
    let minCounty = d3.select(`.county[data-education="${minEd}"]`);
    minCounty.style("fill", "red");

    let minDOMCounty = document.querySelector(
      `.county[data-education="${minEd}"]`
    );
    let countyD = minDOMCounty.getAttribute("d");
    let countyFips = minDOMCounty.getAttribute("data-id");
    let x = Number(countyD.split(/[M,.]/)[1]);
    let y = Number(countyD.split(/[M,.]/)[3]);

    d3
      .select("#tooltip")
      .style("visibility", "visible")
      .style("transform", `translate(${x + 120}px, ${y + 130}px)`)
      .style("top", "0px")
      .style("left", "0px")
      .html(function() {
        let county = education.filter(x => x.fips == countyFips);
        return `${
          county[0].area_name
        }, ${county[0].state}</br>${county[0].bachelorsOrHigher}%`;
      });
  }

  d3
    .select("#container")
    .append("div")
    .attr("id", "smartestButton")
    .text("Most Educated County")
    .on("click", maxSelect);

  d3
    .select("#container")
    .append("div")
    .attr("id", "dumbestButton")
    .text("Least Educated County")
    .on("click", minSelect);

  //RESET COLORS BUTTON

  function resetColors() {
    d3.selectAll(".county").style("fill", d => {
      let filter = education.filter(x => x.fips == d.id);
      return colorSelect(filter[0].bachelorsOrHigher);
    });

    d3
      .select("#tooltip")
      .style("visibility", "hidden")
      .style("transform", "translate(0px");
  }

  d3
    .select("#container")
    .append("div")
    .attr("id", "resetColors")
    .text("Reset Colors")
    .on("click", resetColors);

  // CREATE COUNTIES

  svg
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    .attr("d", d3.geoPath())
    .style("fill", d => {
      let filter = education.filter(x => x.fips == d.id);
      return colorSelect(filter[0].bachelorsOrHigher);
    })
    .attr("data-id", d => d.id)
    .attr("data-fips", (d, i) => d.id)
    .attr("data-education", d => {
      let filter = education.filter(x => x.fips == d.id);
      return filter[0].bachelorsOrHigher;
    })
    .on("mouseover", countyHover)
    .on("mouseout", countyOut);

  //COUNTY HOVER FUNCTIONS
let prevColor ;
  
  function countyHover(d, i) {
    
    prevColor = this.style.fill;

    d3.select(this).style("fill", "red");

    let stateId;
    if (this.getAttribute("data-id").length == 4) {
      stateId = "0" + d.id.toString().substr(0, 1);
    } else {
      stateId = d.id.toString().substr(0, 2);
    }

    d3
      .select('.state[data-id="' + stateId + '"]')
      .style("stroke", "red")
      .style("stroke-width", "2");

    let countyD = this.getAttribute("d");
    let x = Number(countyD.split(/[M,.]/)[1]);
    let y = Number(countyD.split(/[M,.]/)[3]);
    
    d3
      .select("#tooltip")
      .style("visibility", "visible")
      .style("top", (y + 130) + "px")
      .style("left", (x + 130) + "px")
      .attr("data-education", function() {
        let county = education.filter(x => x.fips == d.id);
        return county[0].bachelorsOrHigher;
      })
      .html(function() {
        let county = education.filter(x => x.fips == d.id);
        return `${
          county[0].area_name
        }, ${county[0].state}</br>${county[0].bachelorsOrHigher}%`;
      });
  }

  function countyOut(d, i) {
    
    let slider = document.getElementById("slider"); 
    let sliderColor = window.getComputedStyle(slider).backgroundColor;
    
    if(sliderColor != "rgb(255, 0, 0)"){
      d3.select(this).style("fill", prevColor);
    }
    
    let stateId;
    if (this.getAttribute("data-id").length == 4) {
      stateId = "0" + d.id.toString().substr(0, 1);
    } else {
      stateId = d.id.toString().substr(0, 2);
    }

    d3
      .select('.state[data-id="' + stateId + '"]')
      .style("stroke", "white")
      .style("stroke-width", "1");

    d3
      .select("#tooltip")
      .style("visibility", "hidden")
      .style("transform", "translate(0px");
  }

  //CREATE STATES BORDERS

  svg
    .append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append("path")
    .attr("class", "state")
    .attr("data-id", d => d.id)
    .attr("d", d3.geoPath());

  //LEGEND 

  const legScale = d3
    .scaleBand()
    .domain(edScale)
    .rangeRound([0, 270]);

  const legAxis = d3
    .axisBottom(legScale)
    .tickFormat(d => d + "%")
    .tickSizeOuter(0);
  
  const svg2 = d3
    .select("#legend")
    .append("svg")
    .attr("height", 40)
    .attr("width", 285);

  svg2
    .selectAll("rect")
    .data(edScale)
    .enter()
    .append("rect")
    .attr("class", "legend-node")
    .attr("height", 15)
    .attr("width", 30)
    .attr("fill", d => colorSelect(d))
    .attr("x", (d, i) => i * 30);
  
  svg2
    .append("g")
    .attr("id", "leg-axis")
    .attr("transform", `translate(0, ${15})`)
    .call(legAxis);

  d3
    .selectAll("#legend .tick line")
    .attr("y1", 6)
    .attr("y2", -15)
    .attr("x1", 15)
    .attr("x2", 15);
  
  d3.selectAll("#legend .tick text")
    .attr("x", 15);

  d3
    .select("#container")
    .append("div")
    .attr("id", "tooltip");
}
