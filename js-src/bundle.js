if (undefined === Overlay) {
  try {
    // OVERLAY
    var Overlay = {
      show () {
        document.getElementById('ab-ob').style.display = 'block'
      },

      hide () {
        document.getElementById('ab-ob').style.display = 'none'
      },

      create () {
        const ob = document.createElement('div')

        ob.style.display = 'none'
        ob.style.backgroundColor = 'rgba(0,0,0,.5)'
        ob.style.color = 'lime'
        ob.style.fontFamily = 'Iosevka, monospace'
        ob.style.fontSize = '40px'
        ob.style.fontWeight = 'bold'
        ob.style.position = 'fixed'
        ob.style.top = 0
        ob.style.left = 0
        ob.style.height = '100%'
        ob.style.padding = '30px'
        ob.style.width = '100%'
        ob.id = 'ab-ob'
        ob.zIndex = '8888'

        return ob
      },
    }

    if (null === document.getElementById('ab-ob')) {
      document.body.appendChild(Overlay.create())
      Overlay.hide()
    }
    // OVERLAY

    // DISABLE FORMS
    // This can disable all the inputs (to avoid eating user key commands that pass through)
    var Form = {
      toggle (state) {
        state = !state
        var el = undefined

        var selects = document.getElementsByTagName('select')

        for (var i = 0; i < selects.length; i++) {
          selects[i].disabled = state
          selects[i].blur()
        }

        var textareas = document.getElementsByTagName('textarea')

        for (var i = 0; i < textareas.length; i++) {
          textareas[i].disabled = state;
          textareas[i].blur()
        }

        var buttons = document.getElementsByTagName('button')

        for (var i = 0; i < buttons.length; i++) {
          buttons[i].disabled = state
          buttons[i].blur()
        }

        var inputs = document.getElementsByTagName('input')

        for (var i = inputs.length - 1; i >= 0; i--) {
          inputs[i].disabled = state
          inputs[i].blur()
          el = inputs[i]
        }

        if (false === state) {
          // Focus the first form on page
          setTimeout(() => { el.focus() }, 100)
        }
      },

      disable () {
        Form.toggle(false)
      },

      enable () {
        Form.toggle(true)
      },
    }

    Form.disable()
    // END FORMS

    // HINTING
    // This will control the hinting on page
    var Hinting = {
      map: {},
      mode: false,
      // hints: 'abcdefghijklmnopqrstuvwxyz1234567890'.split(''),
      hints: 'asdfghjklqwertyuiopzxcvbnm1234567890'.split(''),
      buf: [],
      inputThrottled: false,

      get_hint (c, p) {
        var h = document.createElement('div')

        h.style.backgroundColor = 'rgba(0,0,0,.6)'
        h.style.fontFamily = 'Iosevka, monospace'
        h.style.fontSize = '16px'
        h.style.fontWeight = 'bold'
        h.style.padding = '3px'
        h.style.borderRadius = '3px'
        h.style.color = '#af0'
        h.style.position = 'absolute'
        h.style.left = '0'
        h.style.top = '0'
        h.style.zIndex = '999999999999999999999999999999999999999999999'
        h.innerHTML = '<span style="color:#af0;">' + c[0] + '</span><span style="color:#f39">' + c[1] + '</span>'

        return { el: h, parent: p }
      },

      on () {
        Hinting.map = {}
        var links = document.getElementsByTagName('a')
        var hints = Hinting.hints.slice(0, 1 + Math.ceil(Math.sqrt(links.length)))
        var hp1 = 0
        var hp2 = 0

        for (var i = 0; i < links.length; i++) {
          hp2++

          // if (i > Hinting.hints.length) continue
          if (hp2 >= hints.length) {
            hp2 = 0
            hp1++
          }

          // All links exhausted, so move on
          if (undefined === hints[hp1] || undefined === hints[hp2]) continue

          var hint = hints[hp1] + hints[hp2]
          var parent = links[i]

          if (parent.style.display === 'none' || parent.style.display === 'hidden') continue

          // This could maybe break some floating links or something...
          // TODO: Maybe check existing position setting is not absolute first.
          parent.style.position = 'relative'

          var h = Hinting.get_hint(hint, parent)
          parent.appendChild(h.el)

          Hinting.map[hint] = h
        }

        setTimeout(() => { Hinting.mode = true }, 200)
      },

      off () {
        Object.keys(Hinting.map).map((k) => {
          Hinting.map[k].el.remove()
        })

        Hinting.mode = false
      },

      // Remove if the first digit of key does not match
      offIfNot (c) {
        Object.keys(Hinting.map).map((k) => {
          if (k[0] !== c) {
            Hinting.map[k].el.remove()
          } else {
            Hinting.map[k].el.getElementsByTagName('span')[0].style.color = '#666'
          }
        })
      },

      // Simulate an event
      eventFire (el, etype) {
        if (el.fireEvent) {
          el.fireEvent('on' + etype)
        } else {
          var evObj = document.createEvent('Events')
          evObj.initEvent(etype, true, false)
          el.dispatchEvent(evObj)
        }
      },

      find (c, retries = 0) {
        Hinting.mode = false

        var el = Hinting.map[c.toLowerCase()]

        if (undefined === el && retries < 2) {
          Hinting.off()
          Hinting.on()

          return Hinting.find(c, ++retries)
        }

        // alert(el.parentNode)
        // alert(el.parentNode.innerHTML)
        // alert(el.parentNode.href)
        Hinting.eventFire(el.parent, 'click')

        setTimeout(() => {
          Hinting.off()
          Overlay.hide()
        }, 50)
      },

      keyHandler (char) {
        if (false === Hinting.mode) return

        // Sometimes input comes through too fast, so delay it
        if (true === Hinting.inputThrottled) return
        Hinting.inputThrottled = true
        setTimeout(() => { Hinting.inputThrottled = false }, 10)

        Hinting.buf.push(char)
        Hinting.offIfNot(char)

        if (Hinting.buf.length > 1) {
          var findit = Hinting.buf.join('')

          Hinting.buf = []
          Hinting.find(findit)
        }
      },

      bind () {
        // document.removeEventListener('keyup', Hinting.keyHandler)
        // document.addEventListener('keyup', Hinting.keyHandler)
      }
    }

    // Hinting.bind()
    // END HINTING

  } catch (e) {
    alert(e.toString())
  }
}
