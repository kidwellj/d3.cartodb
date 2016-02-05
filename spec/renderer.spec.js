describe('The renderer', function () {
  beforeAll(function () {
    this.renderer = new cartodb.d3.Renderer({index: 0, cartocss: '/** simple visualization */ #snow{ marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }'})
  })

  afterAll(function () {
    document.body.removeChild(document.getElementById('map'))
  })

  it('should have its dependencies loaded', function () {
    expect(d3).not.toEqual(undefined)
    expect(L).not.toEqual(undefined)
    expect(_).not.toEqual(undefined)
    expect(carto).not.toEqual(undefined)
  })

  it('setCartoCSS should update the css renderer', function () {
    this.renderer = new cartodb.d3.Renderer({index:0, cartocss: '/** simple visualization */ #snow{ marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }'})
    var s = this.renderer.shader;
    this.renderer.setCartoCSS('/** simple visualization */ #snow{ marker-fill-opacity: 0.7; marker-line-color: #000; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }')
    expect(this.renderer.shader).not.toEqual(s)
  })

  it('svg tiles should be correctly formed', function () {
    var features = MOCK_TILE
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.renderer.render(svg, features, {x: 2, y: 2, zoom: 3})
    expect(svg.children[0].children.length).toEqual(15)
  })

})
