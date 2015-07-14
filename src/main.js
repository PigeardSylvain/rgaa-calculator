'use strict';

var rgaa = {
    editMode: false,
    currentLevel: "AA",
    nbRules: {"A":0, "AA":0, "AAA":0},
    CS: {
      modepourcent: "Mode pourcent",
      modechecklist: "Mode check-list",
      percentmode: "percentMode",
      checklistmode: "checklistMode",
      resetscore: "Etes-vous certain de vouloir réinitialiser toutes les scores ?",
      defaultprojectname: "Nom du projet XXX",
      calculatorrgaa: "Calculateur RGAA 3"
    }
};

// Execute start method when DOM is ready
function r(f) {/in/.test(document.readyState) ? setTimeout('r(' + f + ')', 9) : f(); }

rgaa.start = function () {
    rgaa.createChapter();
    rgaa.init();
    rgaa.scrollUpdate();
};

rgaa.qsa = function (selector, callback) {
    [].forEach.call(document.querySelectorAll(selector), callback, false);
};

rgaa.init = function () {
    var i = 0, ul;

    rgaa.initHeader();
    rgaa.updateTitle();
    rgaa.initImportExport();

    // Init currentChapter event
    window.addEventListener("scroll", function () {
        rgaa.scrollUpdate();
    });

    // Init checkboxes
    rgaa.qsa("tbody [type=checkbox]", function (el) {
        el.addEventListener("change", function (e) {
            var tr = e.target.parentNode.parentNode;
            if (e.target.checked === true) {
                tr.setAttribute("aria-disabled", "false");
            } else {
                tr.setAttribute("aria-disabled", "true");
            }
            rgaa.computeScore(tr.parentNode.parentNode.parentNode);
        });
    });

    // Init rule event
    rgaa.qsa("tbody td.rule", function (td) {
        td.addEventListener("click", function (e) {
            if (rgaa.editMode) {return true; }
            var tr = e.target.parentNode, input;
            input = tr.querySelector("td:last-child input");

            if (document.body.classList.contains(rgaa.CS.percentmode)) {
              if (input.value) {
                  input.value = (Math.round(input.value / 10) * 10) + 10;
              } else {
                  input.value = 0;
              }
              if (input.value > 100) {
                  input.value = '';
              }
            } else {
              if (input.value && input.value == "100") {
                input.value = "0";
              } else {
                input.value = "100";
              }
            }
            rgaa.rateSave(input.parentNode);
        });
    });

    rgaa.qsa("tbody td.rate", function (td) {
        td.addEventListener("click", function (e) {
          if (document.body.classList.contains(rgaa.CS.checklistmode)) {
            td.previousElementSibling.click();
          }
        });
    });

    // Init score
    ul = document.getElementById('scoreList');
    ul.innerHTML = "";
    rgaa.qsa("section.rulesSection h2", function (el) {
        var li = document.createElement("li");

        li.setAttribute("id", "score-chapter" + i);
        li.innerHTML = el.innerHTML;
        li.children[0].setAttribute("href", "#chapter" + i);

        //li.appendChild(anchor);
        ul.appendChild(li);
        i = i + 1;
    });

    // Init input event
    rgaa.qsa("article input[type=text]", function (el) {
        el.addEventListener("focus", function (e) {
            rgaa.rateCellDisplay(el.parentNode);
            rgaa.setEditMode(el.parentNode.parentNode, true);
        });
        el.addEventListener("blur", function (e) {
            window.setTimeout(function () {
                rgaa.setEditMode(e.target.parentNode.parentNode, false);
                rgaa.rateCellHide(e.target.parentNode);
            }, 100);
        });
        el.addEventListener("keydown", function (e) {
            if (e.keyCode === 13) {
                el.blur();
            }
        });
    });

    document.getElementById("projectName").addEventListener("keydown", function () {
        rgaa.updateTitle();
    });

    rgaa.qsa("td.rate", function (el) {
        el.addEventListener("mouseenter", function (el) {
          if (document.body.classList.contains(rgaa.CS.percentmode)) {
            rgaa.rateCellDisplay(el.target);
          }
        });
        el.addEventListener("mouseleave", function (el) {
            if (!rgaa.editMode) {
                rgaa.rateCellHide(el.target);
            }
        });
    });

    rgaa.computeAllScore();

    document.getElementById("resetButton").addEventListener("click", function () {
        if (window.confirm(rgaa.CS.resetscore)) {
            rgaa.reset();
        }
    });

};

rgaa.initImportExport = function () {

  document.getElementById("btnExportBack").addEventListener("click", function (e) {
    document.body.classList.remove("displayExport");
    document.body.classList.add("displayRules");
    window.location.href = window.location.href.split("#")[0] + "#projectName";
  });

  document.getElementById("btnImportBack").addEventListener("click", function (e) {
    document.body.classList.remove("displayImport");
    document.body.classList.add("displayRules");
    window.location.href = window.location.href.split("#")[0] + "#projectName";
  })

  document.getElementById("btnStartImport").addEventListener("click", function (e) {
      var importString = document.getElementById("importArea").value, jsonObj;

      try {
        jsonObj = JSON.parse(importString);
      } catch (e) {
        document.getElementById("importErrorMessage").innerHTML = e.message;
        return true;
      }

      rgaa.reset();
      document.getElementById("projectName").value = jsonObj.name;
      rgaa.setLevel(document.getElementById(jsonObj.level), true);
      document.body.classList.remove(rgaa.CS.percentmode, rgaa.CS.checklistmode);
      document.body.classList.add(jsonObj.mode);
      document.getElementById("commentArea").value = jsonObj.comment;

      jsonObj.rules.forEach(function (rule, i) {
        var tr = document.getElementById(rule.id).parentNode;
        tr.querySelector("td.rate input").value = rule.value;
        rgaa.rateCellHide(tr.querySelector("td.rate"));
        if (rule.disabled) {
            tr.querySelector("input[type=checkbox]").click();
        }
      });

      rgaa.computeAllScore();
        document.getElementById("btnImportBack").click();
  });

};

rgaa.reset = function () {
    rgaa.qsa("article input[type=text]", function (el) {
        el.value = "";
    });

    rgaa.qsa("article td.rate", function (el) {
      el.removeAttribute("data-completed");
    });

    rgaa.computeAllScore();
    document.getElementById("commentArea").value = "";
    document.getElementById("projectName").value = rgaa.CS.defaultprojectname;
    rgaa.updateTitle();
    rgaa.qsa("td.rate span", function (el) {
        el.innerHTML = "";
    });

    rgaa.qsa("article [type=checkbox]", function (el) {
        el.checked = true;
        el.setAttribute("checked", "");
        el.parentNode.parentNode.setAttribute("aria-disabled", "false");
    });

};

rgaa.updateTitle = function () {
    document.title = document.getElementById("projectName").value + " - " + rgaa.CS.calculatorrgaa;
};

rgaa.computeAllScore = function () {
    rgaa.qsa("article", function (el) {
        rgaa.computeScore(el, true);
    });

    rgaa.scrollUpdate();
    rgaa.computeTotalScore();
    rgaa.computeLabel();
};

rgaa.computeLabel = function () {
    var rules = {"A": 0, "AA": 0, "AAA": 0};

    rgaa.qsa("td.rate input", function (el) {
      if (el.value === "100") {
        rules[el.parentNode.parentNode.getAttribute("class")]++;
      }
    })

    if (rules["A"] === rgaa.nbRules["A"]) {
      if (rules["AA"] >= (rgaa.nbRules["AA"] / 2)) {
        if (rules["AA"] === rgaa.nbRules["AA"]) {
          if (rules["AAA"] > 0) {
            console.log("e accessible : niveau 5");
          } else {
            console.log("e accessible : niveau 4");
          }
        } else {
          console.log("e accessible : niveau 3");
        }
      } else {
        console.log("e accessible : niveau 2");
      }
    }
}

rgaa.computeScore = function (article, isComputeAll) {
    var span, classes, nbRules = 0, score = 0, headerScore, nbChecked = 0, nbTotalRules=0;

    classes = rgaa.getLevelClasses();

    Array.prototype.forEach.call(article.querySelectorAll(classes), function (tr, i) {
      nbTotalRules++;
        var value = tr.querySelector("td.rate input").value;
        if (value) {
            nbRules = nbRules + 1;
            score += parseInt(value, 10);

            if (value == "100") {
              nbChecked++;
              tr.querySelector("td.rate").setAttribute("data-completed", "true");
            } else {
              tr.querySelector("td.rate").setAttribute("data-completed", "false");
            }
        } else {
          tr.querySelector("td.rate").removeAttribute("data-completed");
        }
    });

    score = nbRules === 0 ? "" : Math.round(score / nbRules);
    span = article.querySelector("h2 span");
    article.setAttribute("score", score);
    if (document.body.classList.contains(rgaa.CS.percentmode)) {
      score = score !== "" ? " " + score + "%" : " N/C";
    } else {
      score = " " + nbChecked + "/" + nbTotalRules;
    }

    span.innerHTML = score;
    headerScore = document.querySelector("#currentChapter span")
    if (headerScore) {
        headerScore.innerHTML = score;
    }
    document.getElementById("score-" + span.parentNode.parentNode.parentNode.getAttribute("id")).children[0].children[0].innerHTML = score;

    if (!isComputeAll) {
        rgaa.scrollUpdate();
        rgaa.computeTotalScore();
        rgaa.computeLabel();
    }
};

rgaa.getLevelClasses = function (selector) {
  selector = selector || "";

  if (rgaa.currentLevel === "A") {
      return "tr.A[aria-disabled=false]"+selector;
  } else if (rgaa.currentLevel === "AA") {
      return "tr.A[aria-disabled=false]" + selector + ", tr.AA[aria-disabled=false]" + selector;
  } else {
      return "tr.A[aria-disabled=false]" + selector + ", tr.AA[aria-disabled=false]" + selector + ", tr.AAA[aria-disabled=false]" + selector;
  }

};

rgaa.setEditMode = function (tr, state) {
    if (state) {
        tr.classList.add("edit");
    } else {
        tr.classList.remove("edit");
    }
    rgaa.editMode = state;
};

rgaa.rateCellHide = function (el) {
    var score = el.firstChild, input;
    input = score.nextSibling;
    rgaa.rateSave(el);
    score.classList.remove("hide");
    input.classList.add("axs_hidden");
};

rgaa.rateSave = function (el) {
    var score = el.firstChild, input, value, newScore;
    input = score.nextSibling;
    value = (input.value).trim();
    newScore = value ? value + '%' : '';
    if (newScore !== score.innerHTML) {
        score.innerHTML = newScore;
        rgaa.computeScore(el.parentNode.parentNode.parentNode.parentNode);
    }
};

rgaa.computeTotalScore = function () {
    var totalScore = 0, score, nb = 0, nbCompleted;
    rgaa.qsa("section.rulesSection article", function (el) {
        score = el.getAttribute("score");
        if (score !== "") {
            totalScore += parseInt(score, 10);
            nb = nb + 1;
        }
    });
    if (nb !== 0) {
        totalScore = Math.round((totalScore / nb) * 100) / 100;
    }

    nbCompleted = document.querySelectorAll(rgaa.getLevelClasses(" td.rate[data-completed=true]")).length + "/" + document.querySelectorAll(rgaa.getLevelClasses()).length;

    if (document.body.classList.contains(rgaa.CS.percentmode)) {
      document.querySelector("footer h1 span").innerHTML = (totalScore ? totalScore + "%" : "N/C");
    } else {
      document.querySelector("footer h1 span").innerHTML = " " + nbCompleted;
    }
};

rgaa.rateCellDisplay = function (el) {
    var score = el.firstChild, input;
    if (score) {
        input = score.nextSibling;
        score.classList.add("hide");
        input.classList.remove("axs_hidden");
    }
};

rgaa.initHeader = function () {
    rgaa.setLevel(document.getElementById('AA'), true);
    document.getElementById('AA').checked = true;

    // Level button change event
    rgaa.qsa("header [type=radio]", function (el) {
        el.addEventListener('change', function () {
            rgaa.setLevel(el);
        });
    });

    // Init menu
    rgaa.initMenu();
};

rgaa.initMenu = function () {
  document.getElementById("btnMenu").addEventListener("click", function (e) {
    rgaa.toogleMenu(e);
  });

  if (document.body.classList.contains(rgaa.CS.percentmode)) {
    document.getElementById("btnChangeMode").innerHTML = rgaa.CS.modechecklist;
  } else if (document.body.classList.contains(rgaa.CS.checklistmode)) {
    document.getElementById("btnChangeMode").innerHTML = rgaa.CS.modepourcent;
  } else {
    document.body.classList.add(rgaa.CS.percentmode);
    document.getElementById("btnChangeMode").innerHTML = rgaa.CS.modechecklist;
  }

  document.getElementById("btnChangeMode").addEventListener("click", function (e) {
    if (document.body.classList.contains(rgaa.CS.percentmode)) {
      document.body.classList.remove(rgaa.CS.percentmode);
      document.body.classList.add(rgaa.CS.checklistmode);
      this.innerHTML = rgaa.CS.modepourcent;
    } else {
      document.body.classList.remove(rgaa.CS.checklistmode);
      document.body.classList.add(rgaa.CS.percentmode);
      this.innerHTML = rgaa.CS.modechecklist;
    }
    rgaa.closeMenu();
    rgaa.computeAllScore();
  });

  document.getElementById("btnExport").addEventListener("click", function (e) {
    document.body.classList.remove("displayRules");
    document.body.classList.add("displayExport");
    window.location.href = window.location.href.split("#")[0] + "#exportSection";

    var exportObj = {
      name: document.getElementById("projectName").value,
      level: rgaa.currentLevel,
      mode: document.body.classList.contains(rgaa.CS.percentmode) ? rgaa.CS.percentmode : rgaa.CS.checklistmode,
      comment: document.getElementById("commentArea").value,
      rules: []
    };

    rgaa.qsa(".rulesSection tbody tr", function (tr) {
      var rule = {};
      rule.id = tr.querySelector(".rule").getAttribute("id");
      rule.disabled = tr.getAttribute("aria-disabled") === "true" ? true : false;
      rule.value = tr.querySelector("td.rate input").value;
      exportObj.rules.push(rule);
    });

    document.getElementById("exportArea").value = JSON.stringify(exportObj);
    rgaa.closeMenu();
  });

  document.getElementById("btnImport").addEventListener("click", function (e) {
    document.body.classList.remove("displayRules");
    document.body.classList.add("displayImport");
    window.location.href = window.location.href.split("#")[0] + "#importSection";
    rgaa.closeMenu();
  });

  // Trigger click event when enter key is pressed on menu items
  rgaa.qsa("#menu li", function (el) {
    el.addEventListener("keydown", function (e) {
      e.preventDefault();
      if (e.keyCode == 13) {  // enter key
        this.click();
      } else if (e.keyCode == 27) { // escape key
        rgaa.closeMenu();
      } else if (e.keyCode == 40) { // down arrow
        var el = this.nextElementSibling;
        if (el) {
          el.focus();
        }
      } else if (e.keyCode == 38) { // up arrow
        var el = this.previousElementSibling;
        if (el) {
          el.focus();
        }
      }
    });
  });

  // Trigger click event when enter key is pressed on menu items
  rgaa.qsa("#btnMenu", function (el) {
    el.addEventListener("keydown", function (e) {
      console.log(e.keyCode);
      if (e.keyCode == 27) { // escape key
        rgaa.closeMenu();
      } else if(e.keyCode == 40) { // down arrow
        e.preventDefault();
        document.querySelector("#menu li").focus();
      }
    });
  });

};

rgaa.toogleMenu = function (e) {
  var menu = document.getElementById("menu");
  if (menu.getAttribute("aria-expanded") === "true") {
    rgaa.closeMenu();
  } else {
    rgaa.openMenu();
  }
};

rgaa.openMenu = function () {
    var menu = document.getElementById("menu");
    menu.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
};

rgaa.closeMenu = function () {
    var menu = document.getElementById("menu");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
};

rgaa.setLevel = function (el, noCompute) {
    var section = document.getElementsByTagName("section")[0];

    section.classList.remove("A", "AA", "AAA");

    rgaa.qsa("header [type=radio]", function (el) { el.removeAttribute("checked"); });
    el.setAttribute("checked", "checked");
    document.getElementsByTagName("section")[0].classList.add(el.value);
    rgaa.currentLevel = el.value;

    if (!noCompute) {
        rgaa.computeAllScore();
    }
};

rgaa.createChapter = function () {
    if (document.querySelector("section article")) {
        return true;
    }
    var color = 0, body = document.getElementsByTagName('section')[0];

    // for each chapter
    RGAA.chapters.forEach(function (chapter, i) {
        color = (color === 5) ? 1 : color + 1;

        var a = document.createElement("a"), article = document.createElement("article"), el = document.createElement('h2');

        article.classList.add("color" + color);
        article.setAttribute("id", "chapter" + i);
        // insert chapter title
        el.setAttribute("data-color", "color" + color);
        a.innerHTML = chapter.title;
        a.appendChild(document.createElement("span"));
        a.setAttribute("href", "#footer");

        el.appendChild(a);
        article.appendChild(el);
        article.appendChild(rgaa.createRules(chapter));

        // insert rules
        body.appendChild(article);
    });
};

rgaa.scrollUpdate = function () {
    rgaa.qsa('h2', function (el) {
        if (window.scrollY >= el.parentNode.offsetTop) {
            document.getElementById('currentChapter').innerHTML = el.innerHTML;
            document.getElementsByTagName('header')[0].className = el.getAttribute("data-color");
        }
    });
};

rgaa.createRules = function (chapter) {
    // insert table
    var level, table = document.createElement('table'), tbody = document.createElement("tbody");
    table.innerHTML = '<thead><tr><th class="active"><span class="axs_hidden">activation de la règle</span></th><th class="id">id</th><th class="level">niveau</th><th class="definition">définition</th><th class="rate">score<span class="axs_hidden" id="score-def"> (pourcentage de conformité avec la règle)</th></tr></theader>';

    // insert chapter rules
    chapter.rules.forEach(function (rule, i) {
        var el = document.createElement('tr');
        el.setAttribute("aria-disabled", "false");
        level = rule.level.substr(1, rule.level.length - 2);
        rgaa.nbRules[level]++;
        el.setAttribute('class', level);
        el.innerHTML = '<td><input type="checkbox" checked="checked"></td><td>' + rule.id + '</td><td>' + rule.level + '</td><td id="' + rule.id + '" class="rule">' + rule.text + '</td><td class="rate"><span aria-hidden="true"></span><input class="axs_hidden" type="text" aria-labelledby="' + rule.id + '"></td></tr>';
        tbody.appendChild(el);
    });

    table.appendChild(tbody);
    return table;
};

r(rgaa.start);
