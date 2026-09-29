(function () {
  var dict = {
    hu: {
      title: "EUROSOL – Válasszon irányt",
      p_kicker: "Az Ön műanyag-kereskedője 1999 óta",
      p_lead: "Műanyag alapanyagok, granulátumok és újrahasznosított polimerek – megbízható beszerzés és kereskedelem világszerte.",
      p_cta: "Tovább a kereskedelemhez",
      r_kicker: "Az Ön versenypartnere",
      r_lead: "Csapatunk, autóink, versenynaptárunk és eredményeink – kövesse az Eurosol Racing Team-et a világ rallypályáin.",
      r_cta: "Tovább a csapathoz"
    },
    en: {
      title: "EUROSOL – Choose your direction",
      p_kicker: "Your plastic trader since 1999",
      p_lead: "Plastic raw materials, granulates and recycled polymers – reliable sourcing and trading worldwide.",
      p_cta: "Go to plastics trading",
      r_kicker: "Your racing partner",
      r_lead: "Our team, cars, race calendar and results – follow the Eurosol crew on world rally stages.",
      r_cta: "Go to the team"
    },
    pl: {
      title: "EUROSOL – Wybierz kierunek",
      p_kicker: "Twój dostawca tworzyw od 1999 roku",
      p_lead: "Surowce z tworzyw sztucznych, granulaty i polimery z recyklingu – niezawodne zaopatrzenie i handel na całym świecie.",
      p_cta: "Przejdź do handlu tworzywami",
      r_kicker: "Twój partner w wyścigach",
      r_lead: "Nasz zespół, samochody, kalendarz startów i wyniki – śledź Eurosol Racing Team na rajdowych trasach świata.",
      r_cta: "Przejdź do zespołu"
    },
    de: {
      title: "EUROSOL – Wählen Sie Ihre Richtung",
      p_kicker: "Ihr Kunststoffhändler seit 1999",
      p_lead: "Kunststoff-Rohstoffe, Granulate und Recycling-Polymere – zuverlässige Beschaffung und Handel weltweit.",
      p_cta: "Zum Kunststoffhandel",
      r_kicker: "Ihr Rennsportpartner",
      r_lead: "Unser Team, unsere Autos, Rennkalender und Ergebnisse – begleiten Sie das Eurosol Racing Team auf den Rallye-Strecken der Welt.",
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
