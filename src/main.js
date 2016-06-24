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
    var i = 0, ul, jsonToImport;

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

    // Init comment button
    rgaa.qsa("h2 .icon-chat", function (el) {
      el.addEventListener("click", function (e) {
        var chapterComment = this.parentNode.parentNode.querySelector(".chapterComment");
        if (chapterComment.classList.contains("axs_hidden")) {
          chapterComment.classList.remove("axs_hidden");
          chapterComment.querySelector("textarea").focus();
        } else {
          chapterComment.classList.add("axs_hidden");
          el.blur();
        }
      });
    });

    rgaa.initUpdateCommentIcons();

    // Init rule event
    rgaa.qsa("tbody td.rule", function (td) {
        td.addEventListener("click", function (e) {
            var tr = td.parentNode, input;
            input = tr.querySelector("td:last-child input");

            if (document.body.classList.contains(rgaa.CS.percentmode)) {
              if (rgaa.editMode) {return true; }
              if (input.value) {
                  input.value = (Math.round(input.value / 10) * 10) + 10;
              } else {
                  input.value = 0;
              }
              if (input.value > 100) {
                  input.value = '';
              }
            } else {
              if (input.value == "100") {
                input.value = "0";
                input.setAttribute("aria-checked", "false");
              } else if(input.value === "0") {
                input.value = "";
                input.setAttribute("aria-checked", "false");
              } else {
                input.value = "100";
                input.setAttribute("aria-checked", "true");
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

    rgaa.qsa(".ruleId", function (el) {
      el.addEventListener("click", function (e) {
        if (this.parentNode.classList.contains("displayDescription")) {
          this.removeAttribute("aria-expanded");
          this.parentNode.classList.remove("displayDescription");
        } else {
          this.setAttribute("aria-expanded", "true");
          this.parentNode.classList.add("displayDescription");
        }
      });

      el.addEventListener("keydown", function (e) {
        if (e.keyCode === 13 || e.keyCode === 32) {   // enter, space )
          this.parentNode.classList.toggle("displayDescription");
        }
      });
    });

    rgaa.qsa(".ruleDescription", function (el) {
        el.addEventListener("click", function (e) {
          e.stopPropagation();
        });
    });

    // Init score
    ul = document.getElementById('scoreList');
    ul.innerHTML = "";
    rgaa.qsa("#rulesSection h2", function (el) {
        var li = document.createElement("li");

        li.setAttribute("id", "score-chapter" + i);
        li.innerHTML = "<a href=\"#chapter" + i + "\">"+ el.querySelector("a:last-child").innerHTML + "</a>";
        li.children[0].setAttribute("href", "#chapter" + i);

        //li.appendChild(anchor);
        ul.appendChild(li);
        i = i + 1;
    });

    // Init input event
    rgaa.qsa("article input[type=text]", function (el) {
        el.addEventListener("focus", function (e) {
          if (document.body.classList.contains(rgaa.CS.percentmode)) {
            rgaa.rateCellDisplay(el.parentNode);
          }
          rgaa.setEditMode(el.parentNode.parentNode, true);
        });
        el.addEventListener("blur", function (e) {
            window.setTimeout(function () {
                rgaa.setEditMode(e.target.parentNode.parentNode, false);
                rgaa.rateCellHide(e.target.parentNode);
            }, 0);
        });
        el.addEventListener("keydown", function (e) {
          if (document.body.classList.contains(rgaa.CS.checklistmode)) {
            if (e.keyCode == 9) { // TAB
              return true;
            } else if (e.keyCode === 32) {   // space
              el.parentNode.click();
              e.preventDefault();
            } else if (e.keyCode === 13 || e.keyCode === 40) { // enter, down arrow
              var tr = el.parentNode.parentNode;
              tr = rgaa.nextTr(tr);
              if (tr) {
                tr.querySelector("[type=text]").focus();
              }
            } else if (e.keyCode === 38) { // up
              var tr = el.parentNode.parentNode;
              tr = rgaa.previousTr(tr);
              if (tr) {
                tr.querySelector("[type=text]").focus();
              }
            } else if (e.keyCode === 27) { // escape
              el.value = "";
              rgaa.rateSave(el.parentNode);
            } else {
              e.preventDefault();
            }
          } else {
            if (e.keyCode === 13) {
                el.blur();
            }
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

    // Load values from previous save file (json object is attached at the end of file)
    jsonToImport = document.getElementById("jsonToImport");
    if (jsonToImport.innerHTML !=="") {
      if (!rgaa.startImport(jsonToImport.innerHTML)) {
        document.getElementById("btnImport").click();
        document.getElementById("importArea").value = jsonToImport.innerHTML;
      }
      jsonToImport.innerHTML = "";
    }
};

rgaa.initUpdateCommentIcons = function () {
  rgaa.qsa(".chapterComment textarea", function (el) {
    var article = el.parentNode.parentNode;
    el.addEventListener("blur", function (e) {
      if (el.value) {
        article.classList.add("hasComment");
      } else {
        article.classList.remove("hasComment");
      }
    })
  });
};

rgaa.initImportExport = function () {

// TODO gestion des back (désactivation du menu ?)
  document.getElementById("btnExportBack").addEventListener("click", function (e) {
    rgaa.backToRules();
  });

  document.getElementById("btnImportBack").addEventListener("click", function (e) {
    rgaa.backToRules();
  })

  document.getElementById("btnStartImport").addEventListener("click", function (e) {
      var importString = document.getElementById("importArea").value;
      if (rgaa.startImport(importString)) {
        rgaa.backToRules();
      }
  });

};

rgaa.startImport = function (importString) {
  var jsonObj;

  try {
    jsonObj = JSON.parse(importString);
  } catch (e) {
    document.getElementById("importErrorMessage").innerHTML = e.message;
    return false;
  }

  rgaa.reset();
  document.getElementById("projectName").value = jsonObj.name;
  rgaa.updateTitle();
  rgaa.setLevel(document.getElementById(jsonObj.level), true);
  rgaa.setMode(jsonObj.mode);
  document.getElementById("commentArea").value = jsonObj.comment;

  jsonObj.rules.forEach(function (rule, i) {
    var input, tr = document.getElementById(rule.id).parentNode;
    input = tr.querySelector("td.rate input");
    input.value = rule.value;
    if (rule.value === "100") {
      input.setAttribute("aria-checked", "true");
    } else {
      input.setAttribute("aria-checked", "false");
    }

    rgaa.rateCellHide(tr.querySelector("td.rate"));
    if (rule.disabled) {
        tr.querySelector("input[type=checkbox]").click();
    }
  });

  if (jsonObj.chapterComments) {
    jsonObj.chapterComments.forEach(function (commentObj, i) {
      var area = document.getElementById("commentChapter" + commentObj.id);
      area.value = commentObj.comment;
    })
  }

  rgaa.qsa(".chapterComment textarea", function (el) {
    var article = el.parentNode.parentNode;
    article.classList.remove("hasComment");
    if (el.value) {
      article.classList.add("hasComment");
    } else {
      article.classList.remove("hasComment");
    }
  });

  rgaa.computeAllScore();
  return true;
};

rgaa.setMode = function (mode) {
  document.body.classList.remove(rgaa.CS.percentmode, rgaa.CS.checklistmode);
  document.body.classList.add(mode);

  if (mode === rgaa.CS.percentmode) {
    document.getElementById("btnChangeMode").innerHTML = rgaa.CS.modechecklist;
    rgaa.qsa("#rulesSection input", function (el) {
      el.removeAttribute("role");
      el.removeAttribute("aria-checked");
    });
  } else {
    document.getElementById("btnChangeMode").innerHTML = rgaa.CS.modepourcent;
    rgaa.qsa("#rulesSection input", function (el) {
      el.setAttribute("role", "checkbox");
      if (el.value === "100") {
        el.setAttribute("aria-checked", "true");
      } else {
        el.setAttribute("aria-checked", "false");
      }
    });
  }

};

rgaa.backToRules = function () {
  document.querySelector("section.display").classList.remove("display");
  document.getElementById("rulesSection").classList.add("display");
  window.location.href = window.location.href.split("#")[0] + "#projectName";
};

rgaa.reset = function () {
    rgaa.qsa("article input[type=text]", function (el) {
        el.value = "";
        el.removeAttribute("aria-checked");
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

    rgaa.qsa(".chapterComment textarea", function (area) {
      area.value = "";
    });

    rgaa.qsa(".chapterComment", function (chapter) {
      chapter.classList.add("axs_hidden");
    });

    rgaa.qsa(".hasComment", function (article) {
      article.classList.remove("hasComment");
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
    var rules = {"A": 0, "AA": 0, "AAA": 0}, label;

    rgaa.qsa("td.rate input", function (el) {
      if (el.value === "100") {
        rules[el.parentNode.parentNode.getAttribute("data-level")]++;
      }
    })

    if (rules["A"] === rgaa.nbRules["A"]) {
        if (rules["AA"] >= (rgaa.nbRules["AA"] / 2)) {
          if (rules["AA"] === rgaa.nbRules["AA"]) {
            if (rules["AAA"] > 0) {
              label = 'e-accessible: <strong>niveau 5</strong>';
            } else {
              label = 'e-accessible: <strong>niveau 4</strong>';
            }
          } else {
            label = 'e-accessible: <strong>niveau 3</strong>';
          }
        } else {
          label = 'e-accessible: <strong>niveau 2</strong>';
        }
        document.querySelector("#elabel").innerHTML = 'Cette page peut techniquement bénéficier du label <a target="_blank" title="Plus d\'info sur le label e-accessible" href="http://access42.net/Le-label-e-accessible-pour-les-administrations.html">' + label + '<span class="axs_hidden"> (nouvelle fenêtre)</span></a>.';
      } else {
        document.querySelector("#elabel").innerHTML = '';
    }
};

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

    document.getElementById("score-" + span.parentNode.parentNode.parentNode.getAttribute("id")).querySelector("span").innerHTML = score;

    if (!isComputeAll) {
        rgaa.scrollUpdate();
        rgaa.computeTotalScore();
        rgaa.computeLabel();
    }
};

rgaa.getLevelClasses = function (selector) {
  selector = selector || "";

  if (rgaa.currentLevel === "A") {
      return "tr[data-level=A][aria-disabled=false]"+selector;
  } else if (rgaa.currentLevel === "AA") {
      return "tr[data-level=A][aria-disabled=false]" + selector + ", tr[data-level=AA][aria-disabled=false]" + selector;
  } else {
      return "tr[data-level=A][aria-disabled=false]" + selector + ", tr[data-level=AA][aria-disabled=false]" + selector + ", tr[data-level=AAA][aria-disabled=false]" + selector;
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
    rgaa.qsa("#rulesSection article", function (el) {
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
    rgaa.setMode(rgaa.CS.checklistmode);
    document.getElementById("btnChangeMode").innerHTML = rgaa.CS.modepourcent;
  }

  document.getElementById("btnChangeMode").addEventListener("click", function (e) {
    if (document.body.classList.contains(rgaa.CS.percentmode)) {
      rgaa.setMode(rgaa.CS.checklistmode);
    } else {
      rgaa.setMode(rgaa.CS.percentmode);
    }
    rgaa.closeMenu();
    rgaa.computeAllScore();
  });

  document.getElementById("btnExport").addEventListener("click", function (e) {
    document.getElementById("exportArea").value = "";
    document.querySelector("section.display").classList.remove("display");
    document.getElementById("exportSection").classList.add("display");
    window.location.href = window.location.href.split("#")[0] + "#exportSection";

    document.getElementById("exportArea").value = JSON.stringify(rgaa.getJsonExport());
    rgaa.closeMenu();
  });

  document.getElementById("btnImport").addEventListener("click", function (e) {
    document.querySelector("section.display").classList.remove("display");
    document.getElementById("importSection").classList.add("display");
    window.location.href = window.location.href.split("#")[0] + "#importSection";
    rgaa.closeMenu();
  });

  document.getElementById("btnReport").addEventListener("click", function (e) {
      rgaa.generateReport();
      rgaa.closeMenu();
  });

  document.getElementById("btnSaveAs").addEventListener("click", function (e) {
    var jsonToImport = document.getElementById("jsonToImport");
    rgaa.closeMenu();
    jsonToImport.innerHTML = JSON.stringify(rgaa.getJsonExport());
    rgaa.download(document.title + ".html", "<!DOCTYPE html><html lang=\"fr\">" + document.querySelector("html").innerHTML + "</html>");
    jsonToImport.value = "";
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
    if (document.querySelector("#rulesSection article")) {
        return true;
    }
    var color = 0, body = document.getElementsByTagName('section')[0];

    // for each chapter
    RGAA.chapters.forEach(function (chapter, i) {
        color = (color === 5) ? 1 : color + 1;

        var a = document.createElement("a"), article = document.createElement("article"), el = document.createElement('h2'), iconChat = document.createElement('button'), comment;

        iconChat.setAttribute("title", "Afficher/masquer commentaire pour: " + chapter.title);
        iconChat.setAttribute("class", "icon-chat");
        iconChat.setAttribute("aria-hidden", "true");
        el.appendChild(iconChat);

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

        var comment = document.createElement("div");
        comment.setAttribute("class", "axs_hidden chapterComment");
        comment.innerHTML = "<h3>Commentaire pour: " + chapter.title.split(". ")[1] + "</h3><textarea id=\"commentChapter" + i + "\"></textarea>";
        article.appendChild(comment);

        // insert rules
        body.appendChild(article);
    });
};

rgaa.scrollUpdate = function () {
    rgaa.qsa('#rulesSection h2', function (el) {
        if (window.scrollY >= el.parentNode.offsetTop) {
            document.getElementById('currentChapter').innerHTML = el.innerHTML;
            document.getElementsByTagName('header')[0].className = el.getAttribute("data-color");
        }
    });
};

rgaa.createRules = function (chapter) {
    // insert table
    var level, table = document.createElement('table'), tbody = document.createElement("tbody");
    table.innerHTML = '<thead><tr><th class="active"><span class="axs_hidden">activation de la règle</span></th><th class="id">id<span class="axs_hidden" id="toggle_rule_desc">, activer pour afficher/reduire la description complète de la règle</span></th><th class="level">niveau</th><th class="definition">définition</th><th class="rate">score<span class="axs_hidden" id="score-def"> (pourcentage de conformité avec la règle)</th></tr></theader>';

    // insert chapter rules
    chapter.rules.forEach(function (rule, i) {
        var el = document.createElement('tr');
        el.setAttribute("aria-disabled", "false");
        level = rule.level.substr(1, rule.level.length - 2);
        rgaa.nbRules[level]++;
        el.setAttribute('data-level', level);
        el.innerHTML = '<td><input type="checkbox" checked="checked" aria-label="règle ' + rule.id + '"></td><td tabindex="0" class="ruleId" id="id' + rule.id + '" role="button" aria-describedby="toggle_rule_desc"><span class="axs_hidden">règle </span>' + rule.id + '</td><td>' + rule.level + '</td><td id="' + rule.id + '" class="rule"><span class="axs_hidden">' + rule.id + " </span><span id=\"ruleLabel" + rule.id + "\" class=\"ruleLabel\">" + rule.text + "</span><div class=\"ruleDescription\"><ul>" + rule.description + '</ul></div></td><td class="rate"><span aria-hidden="true"></span><input class="axs_hidden" type="text" aria-labelledby="ruleLabel' + rule.id + '"></td></tr>';
        tbody.appendChild(el);
    });

    table.appendChild(tbody);
    return table;
};

rgaa.getJsonExport = function () {
  var exportObj = {
    name: document.getElementById("projectName").value,
    level: rgaa.currentLevel,
    mode: document.body.classList.contains(rgaa.CS.percentmode) ? rgaa.CS.percentmode : rgaa.CS.checklistmode,
    comment: document.getElementById("commentArea").value,
    rules: [],
    chapterComments: []
  };

  rgaa.qsa("#rulesSection tbody tr", function (tr) {
    var rule = {};
    rule.id = tr.querySelector(".rule").getAttribute("id");
    rule.disabled = tr.getAttribute("aria-disabled") === "true" ? true : false;
    rule.value = tr.querySelector("td.rate input").value;
    exportObj.rules.push(rule);
  });

  rgaa.qsa(".chapterComment textarea", function (area) {
    if (area.value) {
      var commentObj = {};
      commentObj.id = area.getAttribute("id").split("commentChapter")[1];
      commentObj.type = "text";
      commentObj.comment = area.value;
      exportObj.chapterComments.push(commentObj);
    }
  });

  return exportObj;
};

rgaa.download = function (filename, text) {
    var pom = document.createElement('a');

    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
};

// Micro template function
rgaa.tpl = function(a){return Function("v,o","o="+JSON.stringify(a).replace(/<%=(.+?)%>/g,'"+($1)+"').replace(/<%(.+?)%>/g,'";$1;o+="')+";return o")}

rgaa.nextTr = function (tr) {
    var nextTr = tr.nextElementSibling;

    if (!nextTr) {
      var nextTable = tr.parentNode.parentNode.parentNode.nextElementSibling;
      if (!nextTable) {
        return false;
      }
      nextTr = nextTable.querySelector("tbody tr");
    }

    if (nextTr.getAttribute("data-level") && nextTr.getAttribute("data-level").length <= rgaa.currentLevel.length) {
      return nextTr;
    }

    if (nextTr != tr) {
      return rgaa.nextTr(nextTr);
    }

    return false;
};

rgaa.previousTr = function (tr) {
    var previousTr = tr.previousElementSibling;

    if (!previousTr) {
      var previousTable = tr.parentNode.parentNode.parentNode.previousElementSibling;
      if (!previousTable) {
        return false;
      }
      previousTr = previousTable.querySelector("tbody tr:last-child");
    }

    if (previousTr.getAttribute("data-level") && previousTr.getAttribute("data-level").length <= rgaa.currentLevel.length) {
      return previousTr;
    }

    if (previousTr != tr) {
      return rgaa.previousTr(previousTr);
    }

    return false;
};

rgaa.generateReport = function () {
  var w = window.open(""), html="", header="", customStyle;

  rgaa.reportWindow = w;

  if (!rgaa.reportTpl) {
    rgaa.reportTpl = rgaa.tpl(document.getElementById("reportTemplate").innerHTML);
  }

  // minifier bypass
  customStyle = "<li"; customStyle += "nk rel='stylesheet' href='report.css'" + ">"

  header += "<h2>" + document.querySelector("footer h1").innerHTML + "</h2>";
  header += "<div>" + document.getElementById("commentArea").value + "</div>";

  rgaa.qsa("#rulesSection h2", function (el) {
    html += rgaa.getSectionReport(el.parentNode);
  });

  w.document.write(rgaa.reportTpl({"title":document.getElementById("projectName").value,"body":html, "header":header, "style":customStyle}));
  w.document.close();

  Array.prototype.forEach.call(w.document.querySelectorAll(".ruleDescription"), function (el, i) {
    el.parentNode.removeChild(el);
  });

  // execute when report is ready
  var r = function (f) {/in/.test(w.document.readyState) ? setTimeout('r(' + f + ')', 9) : f(); };
  r(rgaa.reportLoaded);
};

rgaa.reportLoaded = function () {
  var w = rgaa.reportWindow;

  try {
    // throw error if custom stylesheet is not found
    w.document.styleSheets[1].cssRules;

    // if no error, remove default style
    var sheet = w.document.getElementsByTagName('style')[0];
    sheet.parentNode.removeChild(sheet);
  }
  catch (err) {
    // if custom styleSheet not provide, catch error ...and do nothing
  }

  rgaa.download(w.document.title + ".html", "<!DOCTYPE html><html lang=\"fr\">" + w.document.querySelector("html").innerHTML + "</html>");
}

rgaa.getSectionReport = function (section) {
  var html = "", errors, comment;

  html += "<section><h2>" + section.querySelector("h2 a").innerHTML + "</h2>"

  // Get not completed rules
  errors = section.querySelectorAll(rgaa.getLevelClasses(' [data-completed=false]'));
  if (errors.length > 0) {
    html += "<h3>Erreur" + ((errors.length>1)?"s":"") + " :</h3>";
    html += "<ul>";
    Array.prototype.forEach.call(errors, function (td, i) {
      html += "<li>" + td.parentNode.querySelector(".rule").innerHTML + "</li>";
    });
    html += "</ul>";
  }

  comment = section.querySelector("textarea").value;
  if (comment) {
    html += "<h3>Commentaire :</h3><div>" + comment + "</div>";
  }

  return html + "</section>";
}
r(rgaa.start);
