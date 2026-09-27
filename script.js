(function () {
  var dict = {
    hu: {
      title: "EUROSOL – Válasszon irányt",
      p_kicker: "Az Ön műanyag-kereskedője",
      p_lead: "Műanyag alapanyagok, granulátumok és újrahasznosított polimerek – megbízható beszerzés és kereskedelem Európa-szerte.",
      p_cta: "Tovább a kereskedelemhez",
      r_kicker: "Az Ön versenypartnere",
      r_lead: "Csapatunk, autóink, versenynaptárunk és eredményeink – kövesse az Eurosol Racing Team-et a magyar rallypályákon.",
      r_cta: "Tovább a csapathoz"
    },
    en: {
      title: "EUROSOL – Choose your direction",
      p_kicker: "Your plastic trader",
      p_lead: "Plastic raw materials, granulates and recycled polymers – reliable sourcing and trading across Europe.",
      p_cta: "Go to plastics trading",
      r_kicker: "Your racing partner",
      r_lead: "Our team, cars, race calendar and results – follow the Eurosol crew on Hungary's rally stages.",
      r_cta: "Go to the team"
    },
    pl: {
      title: "EUROSOL – Wybierz kierunek",
      p_kicker: "Twój dostawca tworzyw",
      p_lead: "Surowce z tworzyw sztucznych, granulaty i polimery z recyklingu – niezawodne zaopatrzenie i handel w całej Europie.",
      p_cta: "Przejdź do handlu tworzywami",
      r_kicker: "Twój partner w wyścigach",
      r_lead: "Nasz zespół, samochody, kalendarz startów i wyniki – śledź Eurosol Racing Team na węgierskich trasach rajdowych.",
      r_cta: "Przejdź do zespołu"
    },
    de: {
      title: "EUROSOL – Wählen Sie Ihre Richtung",
      p_kicker: "Ihr Kunststoffhändler",
      p_lead: "Kunststoff-Rohstoffe, Granulate und Recycling-Polymere – zuverlässige Beschaffung und Handel in ganz Europa.",
      p_cta: "Zum Kunststoffhandel",
      r_kicker: "Ihr Rennsportpartner",
      r_lead: "Unser Team, unsere Autos, Rennkalender und Ergebnisse – begleiten Sie das Eurosol Racing Team auf Ungarns Rallye-Strecken.",
      r_cta: "Zum Team"
    }
  };

  function apply(lang) {
    var d = dict[lang] || dict.hu;
    document.documentElement.lang = lang;
    document.title = d.title;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (d[k]) el.textContent = d[k];
    });
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    });
    try { localStorage.setItem("eurosol-lang", lang); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem("eurosol-lang"); } catch (e) {}
  var nav = (navigator.language || "hu").toLowerCase().slice(0, 2);
  var initial = (saved && dict[saved]) ? saved : (dict[nav] ? nav : "en");
  apply(initial);

  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { apply(b.dataset.lang); });
  });

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();
})();
