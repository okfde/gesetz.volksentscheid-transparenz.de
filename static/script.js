function generateSubToc (level, headings) {
  var ul = document.createElement('ol')
  var lastLi = null;
  for (var i = 0; i < headings.length; i += 1) {
    var heading = headings[i]
    var headingLevel = parseInt(heading.tagName.substring(1), 10)
    if (headingLevel < level) {
      return ul
    }
    if (headingLevel > level) {
      var subToc = generateSubToc(level + 1, headings)
      i = i - 1
      if (lastLi !== null) {
        var button = document.createElement('button')
        button.textContent = '-'
        button.addEventListener('click', (function(toc) {
          return function (e) {
            if (toc.style.display === 'none') {
              this.textContent = '-'
              toc.style.display = 'block'
            } else {
              this.textContent = '+'
              toc.style.display = 'none'
            }
          }
        })(subToc))
        lastLi.appendChild(button)
        // lastLi.insertBefore(button, lastLi.firstChild)
        lastLi.appendChild(subToc)
      } else {
        lastLi = document.createElement('li')
        ul.appendChild(lastLi)
      }
      continue
    }
    headings.splice(0, 1)
    i = i - 1;
    lastLi = document.createElement('li')
    lastLi.className = 'toc-li-' + heading.tagName.toLowerCase()
    var a = document.createElement('a')
    a.href = '#' + heading.id
    a.className = 'toc-link-' + heading.tagName.toLowerCase()
    a.textContent = heading.textContent 
    lastLi.appendChild(a)
    ul.appendChild(lastLi)
  }
  return ul
}

var sectionRegex = /^(?:Zu )?(.*? \d+)\D?/

function getSectionName (heading) {
  var text = heading.textContent
  var match = sectionRegex.exec(text)
  if (match === null) {
    return null
  }
  return match[1]
}

function loadExplanation (e) {
  console.log(this.href)
  var id = decodeURIComponent(this.href.split('#')[1])
  console.log(id)
  var node = document.getElementById(id)
  if (node.nextElementSibling.tagName.indexOf('H') === 0) {
    // next element is another heading, just jump there
    return true
  }
  e.preventDefault()
  var html = [node.outerHTML]
  node = node.nextElementSibling
  while (node.tagName.indexOf('H') !== 0) {
    html.push(node.outerHTML)
    node = node.nextElementSibling
  }
  document.getElementById('annotation').innerHTML = html.join('')
  document.location.href = '#' + this.parentElement.id
}

document.addEventListener('DOMContentLoaded', function () {
  var content = document.getElementById('content')
  var toc = document.getElementById('toc')
  var headings = content.querySelectorAll('h1,h2,h3,h4,h5,h6')
  headingArray = Array.from(headings)
  var ul = generateSubToc(1, headingArray)
  toc.appendChild(ul)


  var mapping = {}
  var explanation = {}
  var mainSections = []
  for (var i = 0; i < headings.length; i += 1) {
    var heading = headings[i]
    if (heading.tagName === 'H1') {
      mainSections.push(i)
    }
    var sectionName = getSectionName(heading)
    if (sectionName === null) {
      continue
    }
    if (heading.textContent.indexOf('Zu ') === 0) {
      explanation[sectionName] = heading
    } else {
      mapping[sectionName] = heading
    }
  }

  /* Go through law draft sections */
  for (var i = mainSections[0]; i < mainSections[1]; i += 1) {
    var heading = headings[i]
    var sectionName = getSectionName(heading)
    if (sectionName === null) {
      continue
    }
    
    if (explanation[sectionName] !== undefined) {
      var link = document.createElement('a')
      link.href = "#" + explanation[sectionName].id
      link.className = 'ref begruendung'
      link.title = "Zur Begründung"
      var jump = explanation[sectionName].nextElementSibling.tagName.indexOf('H') === 0
      if (jump) {
        link.innerHTML = '&rarr;'
      } else {
        link.textContent = 'Begründung'
      }
      link.addEventListener('click', loadExplanation)
      heading.appendChild(link)
    }
  }

  for (var i = mainSections[2]; i < headings.length; i += 1) {
    var heading = headings[i]
    var sectionName = getSectionName(heading)
    if (sectionName === null) {
      continue
    }
    
    if (mapping[sectionName] !== undefined) {
      var link = document.createElement('a')
      link.href = "#" + mapping[sectionName].id
      link.className = 'ref lawsection'
      link.title = "Zur Stelle im Gesetz"
      link.innerHTML = '&rarr;'
      heading.appendChild(link)
    }
  }
})