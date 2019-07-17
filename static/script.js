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
        var button = document.createElement('a')
        button.href="#"
        button.className = 'collapse'
        button.textContent = '[-]'
        button.addEventListener('click', (function(toc) {
          return function (e) {
            e.preventDefault()
            if (toc.style.display === 'none') {
              this.textContent = '[-]'
              toc.style.display = 'block'
            } else {
              this.textContent = '[+]'
              toc.style.display = 'none'
            }
          }
        })(subToc))
        lastLi.appendChild(button)
        // alternative insert
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
    a.addEventListener('click', clickToc)
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

function hasMoreText (node) {
  return node.nextElementSibling.tagName.indexOf('H') !== 0
}

function getLinkTarget (link) {
  return decodeURIComponent(link.href.split('#')[1])
}

function loadExplanation (e) {
  console.log(this.href)
  var id = getLinkTarget(this)
  console.log(id)
  var headingNode = document.getElementById(id)
  if (isSmallScreen || !hasMoreText(headingNode)) {
    // next element is another heading, just jump there
    return true
  }
  e.preventDefault()
  var html = [headingNode.outerHTML]
  var node = headingNode.nextElementSibling
  while (node !== null && node.tagName.indexOf('H') !== 0) {
    html.push(node.outerHTML)
    node = node.nextElementSibling
  }
  html = html.join('')
  html = html.replace(/ id="[^"]+"/g, '').replace(/<a .*<\/a>/, '')
  document.getElementById('annotation-content').innerHTML = html
  document.querySelector('#annotation-content ' + headingNode.tagName.toLowerCase()).scrollIntoView()
  this.parentElement.scrollIntoView()
  clearAnnotationButton.style.display = 'block'
}

function clickToc (e) {
  hideToc()
}

function hideToc () {
  document.getElementById('toc-container').classList.remove('show')
}

var clearAnnotationButton = document.getElementById('clear-annotation')
var showTocButton = document.getElementById('toc-toggler')
var isSmallScreen = window.innerWidth < 576
var isBigScreen = window.innerWidth > 991


document.addEventListener('DOMContentLoaded', function () {
  var content = document.getElementById('content')
  var toc = document.getElementById('toc')
  var headings = content.querySelectorAll('h1,h2,h3,h4,h5,h6')

  clearAnnotationButton.addEventListener('click', function () {
    document.getElementById('annotation-content').innerHTML = ''
    clearAnnotationButton.style.display = 'none'
  })
  showTocButton.addEventListener('click', function () {
    var toc = document.getElementById('toc-container')
    toc.classList.toggle('show')
    toc.scrollIntoView()
  })

  /* Generate TOC */
  headingArray = Array.from(headings)
  var ul = generateSubToc(1, headingArray)
  toc.appendChild(ul)
  // Unhide toc after
  document.getElementById('toc-wrapper').style.display = 'block'

  /* prepare mapping of headings to explanations and reverse */
  var mapping = {}
  var explanation = {}
  var mainSections = []
  for (var i = 0; i < headings.length; i += 1) {
    var heading = headings[i]
    if (heading.tagName === 'H1') {
      mainSections.push(i)
    }

    var link = document.createElement('a')
    link.href = "#" + heading.id
    link.className = 'self no-print'
    link.title = "Anker"
    heading.appendChild(link)

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

  /* Go through law sections and  */
  for (var i = mainSections[0]; i < mainSections[1]; i += 1) {
    var heading = headings[i]
    var sectionName = getSectionName(heading)
    if (sectionName === null) {
      continue
    }
    
    if (explanation[sectionName] !== undefined) {
      var link = document.createElement('a')
      link.href = "#" + explanation[sectionName].id
      link.className = 'ref begruendung no-print'
      link.title = "Zur Begründung"

      if (hasMoreText(explanation[sectionName])) {
        link.textContent = 'Begründung'
      } else {
        link.innerHTML = '&darr;'
      }

      link.addEventListener('click', loadExplanation)
      heading.appendChild(link)
    }
  }

  /* Go through explanation sections and add links */
  for (var i = mainSections[2]; i < headings.length; i += 1) {
    var heading = headings[i]
    var sectionName = getSectionName(heading)
    if (sectionName === null) {
      continue
    }
    
    if (mapping[sectionName] !== undefined) {
      var link = document.createElement('a')
      link.href = "#" + mapping[sectionName].id
      link.className = 'ref lawsection no-print'
      link.title = "Zur Stelle im Gesetz"
      link.innerHTML = '&uarr;'
      heading.appendChild(link)
    }
  }
})