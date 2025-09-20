// // nav.js
// document.addEventListener('DOMContentLoaded', function () {
//   const navToggle = document.querySelector('.nav-toggle');
//   const navLinks = document.querySelector('.nav-links');

//   if (!navToggle || !navLinks) return;

//   // toggle open/close
//   navToggle.addEventListener('click', function () {
//     const isOpen = navLinks.classList.toggle('open');
//     navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
//   });

//   // close menu on outside click
//   document.addEventListener('click', (e) => {
//     if (!e.target.closest('.nav-inner')) {
//       navLinks.classList.remove('open');
//       navToggle.setAttribute('aria-expanded', 'false');
//     }
//   });
// });



// small helpers
document.addEventListener('DOMContentLoaded', () => {
  // NAV TOGGLE (works reliably)
  const navToggle = document.getElementById('navToggle') || document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('mainNav') || document.querySelector('.nav-links');

  if(navToggle && navLinks){
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      // aria
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // animate toggle icon (optional)
      navToggle.classList.toggle('open');
    });
  }

  // AUTO PLAY short muted videos inside cards only when visible (reduce CPU)
  const cardVideos = document.querySelectorAll('.card-video');
  if ('IntersectionObserver' in window) {
    const vObs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        const vid = ent.target;
        if(ent.isIntersecting) {
          vid.play().catch(()=>{/* autoplay blocked */});
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.4 });

    cardVideos.forEach(v => vObs.observe(v));
  } else {
    cardVideos.forEach(v => { v.play().catch(()=>{}); });
  }

  // reveal fades on scroll
  const faders = document.querySelectorAll('.fade');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  faders.forEach(f => io.observe(f));

  // numeric counters (when in view)
  const counters = document.querySelectorAll('.stat .num');
  if(counters.length){
    const counterObs = new IntersectionObserver((entries, o2) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const el = e.target;
          const target = +el.dataset.target || 0;
          let current = 0;
          const step = Math.max(1, Math.floor(target / 80));
          const t = setInterval(() => {
            current += step;
            if(current >= target){
              el.textContent = target;
              clearInterval(t);
            } else {
              el.textContent = current;
            }
          }, 12);
          o2.unobserve(el);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(c => counterObs.observe(c));
  }

  // bubbles animate durations (set inline style in HTML or JS)
  document.querySelectorAll('.bubble').forEach(b => {
    const dur = b.style.animationDuration || (12 + Math.random()*12) + 's';
    b.style.animationDuration = dur;
    b.style.width = b.style.width || '18px';
    b.style.height = b.style.height || b.style.width;
  });

  // set year
  document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());
});




// Taxonomy 

let records = [];

function loadCSV() {
  Papa.parse('data/dummy_marine_data.csv', {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: function(results) {
      // Trim headers and remove empty rows
      records = results.data
        .map(r => {
          const cleaned = {};
          for (let k in r) cleaned[k.trim()] = r[k];
          return cleaned;
        })
        .filter(r => r && r["scientific_name"]); // Only keep rows with valid scientific_name

      populateTable();
    },
    error: function(err) {
      console.error(err);
      alert("CSV load error: " + err);
    }
  });
}

function populateTable() {
  const tbody = document.querySelector("#speciesTable tbody");
  tbody.innerHTML = "";

  records.forEach(r => {
    const row = `
      <tr>
        <td>${r["individual_count"] || ""}</td>
        <td>${r["sex"] || ""}</td>
        <td>${r["habitat"] || ""}</td>
        <td>${r["water_body"] || ""}</td>
        <td>${r["country"] || ""}</td>
        <td>${r["locality"] || ""}</td>
        <td>${r["min_depth"] || ""}</td>
        <td>${r["latitude"] || ""}</td>
        <td>${r["longitude"] || ""}</td>
        <td>${r["scientific_name"] || ""}</td>
        <td>${r["common_name"] || ""}</td>
      </tr>`;
    tbody.insertAdjacentHTML("beforeend", row);
  });
}

function initMap() {
  const centerCoords = { lat: 12.5, lng: 75.0 };
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 5,
    center: centerCoords
  });

  // Sample species markers
  const speciesData = [
    {
      coords: { lat: 15.3, lng: 73.8 },
      name: "Tuna",
      abundance: "High",
      threat: "Overfishing",
      info: "Tuna stocks are critical for export fisheries, but unsustainable practices are a major threat."
    },
    {
      coords: { lat: 9.9, lng: 76.3 },
      name: "Mackerel",
      abundance: "Moderate",
      threat: "Habitat Degradation",
      info: "Mackerel are an important food fish in India. Climate change and pollution affect their habitats."
    },
    {
      coords: { lat: 18.6, lng: 72.9 },
      name: "Sardine",
      abundance: "Fluctuating",
      threat: "Climate Variability",
      info: "Sardine populations are highly sensitive to ocean temperature shifts and monsoon cycles."
    }
  ];

  speciesData.forEach(species => {
    const marker = new google.maps.Marker({
      position: species.coords,
      map: map,
      title: species.name
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="max-width:250px;">
          <h3>${species.name}</h3>
          <p><b>Abundance:</b> ${species.abundance}</p>
          <p><b>Main Threat:</b> ${species.threat}</p>
          <p>${species.info}</p>
        </div>
      `
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  });
}

// Initialize map and load CSV on page load
window.onload = function() {
  initMap();
  loadCSV();
};




// Visuallizaion script 


 // Pie Chart
    new Chart(document.getElementById("pieChart"), {
      type: 'pie',
      data: {
        labels: ["Tuna", "Sardine", "Mackerel", "Anchovy", "Others"],
        datasets: [{
          data: [30, 20, 25, 15, 10],
          backgroundColor: ["#ffcc00", "#00bcd4", "#4caf50", "#ff5722", "#9c27b0"]
        }]
      }
    });

    // Bar Chart
    new Chart(document.getElementById("barChart"), {
      type: 'bar',
      data: {
        labels: ["Bay of Bengal", "Arabian Sea", "Indian Ocean"],
        datasets: [{
          label: "Fish Abundance (tons)",
          data: [120, 90, 150],
          backgroundColor: "rgba(0, 102, 204, 0.7)"
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

    // Line Chart
    new Chart(document.getElementById("lineChart"), {
      type: 'line',
      data: {
        labels: ["2018", "2019", "2020", "2021", "2022"],
        datasets: [{
          label: "Temperature (°C)",
          data: [26, 26.5, 27, 27.8, 28],
          borderColor: "#ff5722",
          fill: false,
          tension: 0.3
        }]
      }
    });