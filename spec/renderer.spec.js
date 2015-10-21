describe("The renderer", function() {
	beforeAll(function(){
		var d = document.createElement("div");
		d.setAttribute("id", "map");
		document.body.appendChild(d);
		var c = [40.71512685201709, -74.00201797485352];
		this.map = new L.Map("map", {center: c, zoom: 3});
		this.layer = new L.CartoDBd3Layer({
	    user: 'fdansv',
	    table: 'snow',
	    cartocss: "/** simple visualization */ #snow{ marker-fill-opacity: 0.9; marker-line-color: #FFF; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }"
	  })
		spyOn(this.layer, "loadTile");
	  this.layer.addTo(this.map);
	  this.renderer = this.layer.renderer;
	});

	afterAll(function(){
		document.body.removeChild(document.getElementById('map'));
	});

	it("should have its dependencies loaded", function() {
		expect(d3).not.toEqual(undefined);
		expect(L).not.toEqual(undefined);
		expect(_).not.toEqual(undefined);
		expect(carto).not.toEqual(undefined);
	});

	it("setCartoCSS should update the css renderer", function(done) {
		spyOn(this.layer, "_updateTiles");
		this.layer.setCartoCSS("/** simple visualization */ #snow{ marker-fill-opacity: 0.7; marker-line-color: #000; marker-line-width: 1; marker-line-opacity: 1; marker-placement: point; marker-type: ellipse; marker-width: 10; marker-fill: #FF6600; marker-allow-overlap: true; }")
		var self = this;
		_.defer(function(){
			expect(self.layer._updateTiles).toHaveBeenCalled();
			done();
		});
	});

	it("query shouldn't be performed if the tile is in cache", function(done) {
		var self = this;
		this.map.zoomIn();
		_.defer(function(){
			self.map.zoomOut();
			spyOn(self.renderer, "_query");
			_.defer(function(){
				expect(self.renderer._query).not.toHaveBeenCalled();
				done();
			})
		})
	});

	it("tile bounds should be calculated correctly", function() {
		spyOn(this.renderer, "getGeometry");
		this.renderer.drawTile(null, {x: 2, y: 3, zoom: 3});
		expect(this.renderer.getGeometry).toHaveBeenCalled();
		expect(this.renderer.getGeometry.calls.first().args[0]).toEqual("SELECT * FROM snow WHERE the_geom && ST_MakeEnvelope(-45,0,-90,40.97989806962014, 4326)");
	});

	it("should cache tile if it has just downloaded it", function() {
		// this.renderer.drawTile = function(t, p, c){
		// 	prevDrawTile(t, p, function(){
		// 		dump(Object.keys(self.renderer.tileCache));
		// 		done();
		// 	})
		// }
		// this.layer._updateTiles();
	});

	// it("render should be called once per tile", function() {
	// 	expect(this.layer.loadTile).toHaveBeenCalled();
	// 	// This is specific for this example and map position, might not be the best test
	// 	expect(this.layer.loadTile.calls.count()).toEqual(3); 
	// });

	it("sql query should contain ST_MakeEnvelope", function(){
		spyOn(d3,"json");
		this.renderer.drawTile(null, {x: 2, y: 3, zoom: 3});
		expect(d3.json.calls.first().args[0].indexOf("ST_MakeEnvelope")).not.toEqual(-1);
	});

	it("should return correct pixel size for zoom", function(){
		expect(this.renderer.pixelSizeForZoom(3)).toEqual(19567.87939453125);
		expect(this.renderer.pixelSizeForZoom(10)).toEqual(152.8740577697754);
		expect(this.renderer.pixelSizeForZoom(14)).toEqual(9.554628610610962);
	});

	it("svg tiles should be correctly formed", function(){
		var features = '{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-9783939.697266,5244191.677734],[-9783939.697266,5205055.918945],[-9744803.938477,5146352.280762],[-9744803.938477,4754994.692871],[-9764371.817871,4754994.692871],[-9744803.938477,4676723.175293],[-9764371.817871,4637587.416504],[-9803507.57666,4618019.537109],[-9783939.697266,4618019.537109],[-9783939.697266,4598451.657715],[-9803507.57666,4598451.657715],[-9803507.57666,4520180.140137],[-9842643.335449,4500612.260742],[-9842643.335449,4481044.381348],[-9862211.214844,4481044.381348],[-9842643.335449,4481044.381348],[-9842643.335449,4441908.622559],[-9862211.214844,4461476.501953],[-9920914.853027,4461476.501953],[-9920914.853027,4441908.622559],[-9940482.732422,4441908.622559],[-9960050.611816,4461476.501953],[-9960050.611816,4520180.140137],[-10038322.129395,4598451.657715],[-10057890.008789,4598451.657715],[-10038322.129395,4715858.934082],[-10097025.767578,4715858.934082],[-10097025.767578,4754994.692871],[-10175297.285156,4833266.210449],[-10194865.164551,4891969.848633],[-10175297.285156,4911537.728027],[-10175297.285156,4950673.486816],[-10136161.526367,4970241.366211],[-10116593.646973,5009377.125],[-10116593.646973,5028945.004395],[-10136161.526367,5028945.004395],[-10136161.526367,5068080.763184],[-10057890.008789,5087648.642578],[-10057890.008789,5126784.401367],[-10038322.129395,5126784.401367],[-10038322.129395,5185488.039551],[-10057890.008789,5185488.039551],[-10057890.008789,5205055.918945],[-10097025.767578,5244191.677734],[-9783939.697266,5244191.677734]]]]},"properties":{"cartodb_id":64,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3546","diss_me":3546,"iso_3166_2":"US-IL","name":"Illinois","name_alt":"IL|Ill.","code_local":"US17","code_hasc":"US.IL","region":"Midwest","region_big":"East North Central","gadm_level":1,"abbrev":"Ill.","postal":"IL","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-7983694.792969,5165920.160156],[-7983694.792969,5068080.763184],[-8022830.551758,5068080.763184],[-8042398.431152,5048512.883789],[-8061966.310547,5068080.763184],[-8061966.310547,5048512.883789],[-8120669.94873,5048512.883789],[-8198941.466309,5009377.125],[-8179373.586914,5048512.883789],[-8179373.586914,5165920.160156],[-7983694.792969,5165920.160156]]]]},"properties":{"cartodb_id":56,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3537","diss_me":3537,"iso_3166_2":"US-CT","name":"Connecticut","name_alt":"CT|Conn.","code_local":"US09","code_hasc":"US.CT","region":"Northeast","region_big":"New England","gadm_level":1,"abbrev":"Conn.","postal":"CT","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-7924991.154785,5087648.642578],[-7944559.03418,5087648.642578],[-7944559.03418,5107216.521973],[-7924991.154785,5107216.521973],[-7924991.154785,5087648.642578]]],[[[-7944559.03418,5126784.401367],[-7924991.154785,5126784.401367],[-7924991.154785,5107216.521973],[-7944559.03418,5126784.401367],[-7944559.03418,5087648.642578],[-7964126.913574,5068080.763184],[-8003262.672363,5068080.763184],[-7983694.792969,5068080.763184],[-7983694.792969,5165920.160156],[-7944559.03418,5165920.160156],[-7944559.03418,5126784.401367]]]]},"properties":{"cartodb_id":89,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3539","diss_me":3539,"iso_3166_2":"US-RI","name":"Rhode Island","name_alt":"State of Rhode Island and Providence Plantations|RI|R.I.","code_local":"US44","code_hasc":"US.RI","region":"Northeast","region_big":"New England","gadm_level":1,"abbrev":"R.I.","postal":"RI","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-8061966.310547,5263759.557129],[-8140237.828125,5263759.557129],[-8140237.828125,5283327.436523],[-8159805.70752,5283327.436523],[-8159805.70752,5400734.712891],[-8179373.586914,5400734.712891],[-8159805.70752,5420302.592285],[-8179373.586914,5479006.230469],[-8159805.70752,5498574.109863],[-8159805.70752,5615981.38623],[-7964126.913574,5615981.38623],[-7964126.913574,5537709.868652],[-8022830.551758,5518141.989258],[-8022830.551758,5459438.351074],[-8061966.310547,5400734.712891],[-8061966.310547,5302895.315918],[-8081534.189941,5302895.315918],[-8061966.310547,5263759.557129]]]]},"properties":{"cartodb_id":96,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3540","diss_me":3540,"iso_3166_2":"US-VT","name":"Vermont","name_alt":"VT","code_local":"US50","code_hasc":"US.VT","region":"Northeast","region_big":"New England","gadm_level":1,"abbrev":"Vt.","postal":"VT","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-7866287.516602,5322463.195312],[-7905423.275391,5283327.436523],[-7924991.154785,5283327.436523],[-7924991.154785,5263759.557129],[-8061966.310547,5263759.557129],[-8061966.310547,5283327.436523],[-8081534.189941,5283327.436523],[-8081534.189941,5302895.315918],[-8061966.310547,5302895.315918],[-8061966.310547,5400734.712891],[-8022830.551758,5459438.351074],[-8022830.551758,5518141.989258],[-7964126.913574,5537709.868652],[-7964126.913574,5615981.38623],[-7944559.03418,5674685.024414],[-7924991.154785,5655117.14502],[-7905423.275391,5674685.024414],[-7905423.275391,5381166.833496],[-7866287.516602,5322463.195312]]]]},"properties":{"cartodb_id":80,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3538","diss_me":3538,"iso_3166_2":"US-NH","name":"New Hampshire","name_alt":"NH|N.H.","code_local":"US33","code_hasc":"US.NH","region":"Northeast","region_big":"New England","gadm_level":1,"abbrev":"N.H.","postal":"NH","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-8316348.742676,5068080.763184],[-8335916.62207,5028945.004395],[-8355484.501465,5028945.004395],[-8355484.501465,4989809.245605],[-8375052.380859,4970241.366211],[-8375052.380859,4950673.486816],[-8355484.501465,4950673.486816],[-8355484.501465,4931105.607422],[-8316348.742676,4891969.848633],[-8394620.260254,4833266.210449],[-8414188.139648,4852834.089844],[-8414188.139648,4833266.210449],[-8962088.762695,4833266.210449],[-8962088.762695,5165920.160156],[-8883817.245117,5205055.918945],[-8883817.245117,5165920.160156],[-8394620.260254,5165920.160156],[-8355484.501465,5146352.280762],[-8355484.501465,5087648.642578],[-8316348.742676,5068080.763184]]]]},"properties":{"cartodb_id":88,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3560","diss_me":3560,"iso_3166_2":"US-PA","name":"Pennsylvania","name_alt":"Commonwealth of Pennsylvania|PA","code_local":"US42","code_hasc":"US.PA","region":"Northeast","region_big":"Middle Atlantic","gadm_level":1,"abbrev":"Pa.","postal":"PA","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-8257645.104492,4813698.331055],[-8257645.104492,4794130.45166],[-8257645.104492,4833266.210449],[-8257645.104492,4813698.331055]]],[[[-8257645.104492,4931105.607422],[-8238077.225098,4931105.607422],[-8238077.225098,4833266.210449],[-8238077.225098,4872401.969238],[-8257645.104492,4852834.089844],[-8277212.983887,4774562.572266],[-8296780.863281,4774562.572266],[-8296780.863281,4754994.692871],[-8316348.742676,4754994.692871],[-8316348.742676,4715858.934082],[-8335916.62207,4715858.934082],[-8335916.62207,4735426.813477],[-8375052.380859,4754994.692871],[-8414188.139648,4794130.45166],[-8414188.139648,4813698.331055],[-8316348.742676,4891969.848633],[-8355484.501465,4931105.607422],[-8355484.501465,4950673.486816],[-8375052.380859,4950673.486816],[-8355484.501465,5028945.004395],[-8335916.62207,5028945.004395],[-8316348.742676,5068080.763184],[-8296780.863281,5068080.763184],[-8277212.983887,5028945.004395],[-8218509.345703,5009377.125],[-8238077.225098,5009377.125],[-8257645.104492,4931105.607422]]]]},"properties":{"cartodb_id":81,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3558","diss_me":3558,"iso_3166_2":"US-NJ","name":"New Jersey","name_alt":"NJ|N.J.","code_local":"US34","code_hasc":"US.NJ","region":"Northeast","region_big":"Middle Atlantic","gadm_level":1,"abbrev":"N.J.","postal":"NJ","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-9431717.868164,5107216.521973],[-9431717.868164,4872401.969238],[-9451285.747559,4833266.210449],[-9451285.747559,4715858.934082],[-9431717.868164,4715858.934082],[-9431717.868164,4696291.054688],[-9509989.385742,4676723.175293],[-9509989.385742,4657155.295898],[-9529557.265137,4657155.295898],[-9529557.265137,4637587.416504],[-9568693.023926,4598451.657715],[-9568693.023926,4578883.77832],[-9607828.782715,4598451.657715],[-9627396.662109,4598451.657715],[-9627396.662109,4559315.898926],[-9666532.420898,4578883.77832],[-9686100.300293,4578883.77832],[-9686100.300293,4559315.898926],[-9725236.059082,4559315.898926],[-9744803.938477,4578883.77832],[-9744803.938477,4559315.898926],[-9744803.938477,4578883.77832],[-9744803.938477,4559315.898926],[-9783939.697266,4559315.898926],[-9783939.697266,4539748.019531],[-9803507.57666,4559315.898926],[-9803507.57666,4598451.657715],[-9783939.697266,4598451.657715],[-9783939.697266,4618019.537109],[-9803507.57666,4618019.537109],[-9783939.697266,4618019.537109],[-9744803.938477,4676723.175293],[-9744803.938477,4715858.934082],[-9764371.817871,4735426.813477],[-9764371.817871,4754994.692871],[-9744803.938477,4754994.692871],[-9744803.938477,5126784.401367],[-9744803.938477,5107216.521973],[-9686100.300293,5107216.521973],[-9666532.420898,5126784.401367],[-9431717.868164,5126784.401367],[-9431717.868164,5107216.521973]]]]},"properties":{"cartodb_id":65,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3547","diss_me":3547,"iso_3166_2":"US-IN","name":"Indiana","name_alt":"IN|Ind.","code_local":"US18","code_hasc":"US.IN","region":"Midwest","region_big":"East North Central","gadm_level":1,"abbrev":"Ind.","postal":"IN","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-7592337.205078,5518141.989258],[-7611905.084473,5518141.989258],[-7611905.084473,5498574.109863],[-7611905.084473,5537709.868652],[-7592337.205078,5537709.868652],[-7592337.205078,5518141.989258]]],[[[-7670608.722656,5968203.215332],[-7651040.843262,5987771.094727],[-7611905.084473,5987771.094727],[-7611905.084473,6007338.974121],[-7592337.205078,6007338.974121],[-7553201.446289,5968203.215332],[-7553201.446289,5733388.662598],[-7514065.6875,5713820.783203],[-7514065.6875,5655117.14502],[-7474929.928711,5655117.14502],[-7474929.928711,5596413.506836],[-7455362.049316,5596413.506836],[-7474929.928711,5576845.627441],[-7514065.6875,5576845.627441],[-7514065.6875,5557277.748047],[-7553201.446289,5557277.748047],[-7572769.325684,5518141.989258],[-7572769.325684,5537709.868652],[-7631472.963867,5537709.868652],[-7631472.963867,5498574.109863],[-7631472.963867,5518141.989258],[-7651040.843262,5518141.989258],[-7651040.843262,5557277.748047],[-7690176.602051,5479006.230469],[-7729312.36084,5459438.351074],[-7729312.36084,5439870.47168],[-7768448.119629,5459438.351074],[-7768448.119629,5439870.47168],[-7768448.119629,5459438.351074],[-7768448.119629,5439870.47168],[-7807583.878418,5439870.47168],[-7807583.878418,5420302.592285],[-7827151.757812,5420302.592285],[-7807583.878418,5400734.712891],[-7866287.516602,5342031.074707],[-7866287.516602,5322463.195312],[-7905423.275391,5381166.833496],[-7905423.275391,5674685.024414],[-7885855.395996,5674685.024414],[-7885855.395996,5655117.14502],[-7885855.395996,5694252.903809],[-7866287.516602,5694252.903809],[-7846719.637207,5752956.541992],[-7827151.757812,5752956.541992],[-7827151.757812,5811660.180176],[-7768448.119629,5909499.577148],[-7768448.119629,5948635.335938],[-7748880.240234,5948635.335938],[-7709744.481445,6026906.853516],[-7670608.722656,5968203.215332]]]]},"properties":{"cartodb_id":71,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3561","diss_me":3561,"iso_3166_2":"US-ME","name":"Maine","name_alt":"ME|Maine","code_local":"US23","code_hasc":"US.ME","region":"Northeast","region_big":"New England","gadm_level":1,"abbrev":"Maine","postal":"ME","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-9979618.491211,6105178.371094],[-10077457.888184,6046474.73291],[-10116593.646973,6046474.73291],[-10116593.646973,6026906.853516],[-10253568.802734,5909499.577148],[-10253568.802734,5889931.697754],[-10273136.682129,5889931.697754],[-10273136.682129,5792092.300781],[-10292704.561523,5792092.300781],[-10331840.320312,5752956.541992],[-10331840.320312,5713820.783203],[-10312272.440918,5694252.903809],[-10312272.440918,5674685.024414],[-10331840.320312,5674685.024414],[-10331840.320312,5576845.627441],[-10312272.440918,5557277.748047],[-10273136.682129,5557277.748047],[-10273136.682129,5537709.868652],[-10253568.802734,5537709.868652],[-10253568.802734,5518141.989258],[-10214433.043945,5498574.109863],[-10214433.043945,5479006.230469],[-10194865.164551,5479006.230469],[-10155729.405762,5439870.47168],[-10155729.405762,5381166.833496],[-10742765.787598,5381166.833496],[-10742765.787598,5674685.024414],[-10781901.546387,5713820.783203],[-10781901.546387,5733388.662598],[-10742765.787598,5752956.541992],[-10742765.787598,5811660.180176],[-10762333.666992,5811660.180176],[-10762333.666992,5870363.818359],[-10781901.546387,5889931.697754],[-10781901.546387,6046474.73291],[-10801469.425781,6066042.612305],[-10821037.305176,6144314.129883],[-10821037.305176,6281289.285645],[-10586222.752441,6281289.285645],[-10586222.752441,6339992.923828],[-10566654.873047,6339992.923828],[-10566654.873047,6300857.165039],[-10527519.114258,6222585.647461],[-10468815.476074,6222585.647461],[-10449247.59668,6203017.768066],[-10331840.320312,6203017.768066],[-10292704.561523,6183449.888672],[-10292704.561523,6144314.129883],[-10273136.682129,6144314.129883],[-10273136.682129,6163882.009277],[-10234000.92334,6163882.009277],[-10234000.92334,6144314.129883],[-10194865.164551,6124746.250488],[-10116593.646973,6144314.129883],[-10116593.646973,6124746.250488],[-10018754.25,6124746.250488],[-10018754.25,6105178.371094],[-9979618.491211,6105178.371094]]]]},"properties":{"cartodb_id":73,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3514","diss_me":3514,"iso_3166_2":"US-MN","name":"Minnesota","name_alt":"MN|Minn.","code_local":"US32","code_hasc":"US.MN","region":"Midwest","region_big":"West North Central","gadm_level":1,"abbrev":"Minn.","postal":"MN","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-7788015.999023,5048512.883789],[-7827151.757812,5048512.883789],[-7807583.878418,5068080.763184],[-7788015.999023,5068080.763184],[-7788015.999023,5048512.883789]]],[[[-7846719.637207,5068080.763184],[-7885855.395996,5068080.763184],[-7866287.516602,5087648.642578],[-7846719.637207,5068080.763184]]],[[[-7885855.395996,5263759.557129],[-7866287.516602,5263759.557129],[-7866287.516602,5244191.677734],[-7885855.395996,5244191.677734],[-7905423.275391,5205055.918945],[-7866287.516602,5205055.918945],[-7846719.637207,5126784.401367],[-7788015.999023,5126784.401367],[-7788015.999023,5146352.280762],[-7827151.757812,5165920.160156],[-7807583.878418,5185488.039551],[-7788015.999023,5107216.521973],[-7846719.637207,5107216.521973],[-7866287.516602,5087648.642578],[-7866287.516602,5126784.401367],[-7905423.275391,5087648.642578],[-7924991.154785,5087648.642578],[-7944559.03418,5165920.160156],[-8179373.586914,5165920.160156],[-8159805.70752,5283327.436523],[-8140237.828125,5283327.436523],[-8140237.828125,5263759.557129],[-7924991.154785,5263759.557129],[-7924991.154785,5283327.436523],[-7885855.395996,5302895.315918],[-7885855.395996,5263759.557129]]]]},"properties":{"cartodb_id":69,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3513","diss_me":3513,"iso_3166_2":"US-MA","name":"Massachusetts","name_alt":"Commonwealth of Massachusetts|MA|Mass.","code_local":"US25","code_hasc":"US.MA","region":"Northeast","region_big":"New England","gadm_level":1,"abbrev":"Mass.","postal":"MA","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-9568693.023926,5635549.265625],[-9588260.90332,5635549.265625],[-9588260.90332,5655117.14502],[-9568693.023926,5635549.265625]]],[[[-9529557.265137,5713820.783203],[-9529557.265137,5752956.541992],[-9509989.385742,5733388.662598],[-9509989.385742,5713820.783203],[-9529557.265137,5713820.783203]]],[[[-9431717.868164,5752956.541992],[-9275174.833008,5655117.14502],[-9275174.833008,5635549.265625],[-9294742.712402,5635549.265625],[-9275174.833008,5596413.506836],[-9275174.833008,5518141.989258],[-9294742.712402,5498574.109863],[-9294742.712402,5518141.989258],[-9294742.712402,5479006.230469],[-9314310.591797,5479006.230469],[-9314310.591797,5459438.351074],[-9333878.471191,5459438.351074],[-9353446.350586,5420302.592285],[-9314310.591797,5400734.712891],[-9275174.833008,5439870.47168],[-9275174.833008,5459438.351074],[-9255606.953613,5459438.351074],[-9255606.953613,5479006.230469],[-9216471.194824,5479006.230469],[-9177335.436035,5361598.954102],[-9177335.436035,5263759.557129],[-9196903.31543,5263759.557129],[-9196903.31543,5244191.677734],[-9196903.31543,5263759.557129],[-9216471.194824,5263759.557129],[-9236039.074219,5205055.918945],[-9255606.953613,5205055.918945],[-9255606.953613,5165920.160156],[-9275174.833008,5165920.160156],[-9294742.712402,5126784.401367],[-9412149.98877,5126784.401367],[-9431717.868164,5107216.521973],[-9431717.868164,5126784.401367],[-9666532.420898,5126784.401367],[-9646964.541504,5165920.160156],[-9627396.662109,5165920.160156],[-9607828.782715,5205055.918945],[-9607828.782715,5263759.557129],[-9588260.90332,5283327.436523],[-9607828.782715,5302895.315918],[-9627396.662109,5381166.833496],[-9627396.662109,5498574.109863],[-9607828.782715,5498574.109863],[-9607828.782715,5576845.627441],[-9588260.90332,5576845.627441],[-9588260.90332,5615981.38623],[-9549125.144531,5615981.38623],[-9529557.265137,5655117.14502],[-9529557.265137,5596413.506836],[-9529557.265137,5615981.38623],[-9509989.385742,5615981.38623],[-9529557.265137,5576845.627441],[-9509989.385742,5596413.506836],[-9509989.385742,5674685.024414],[-9451285.747559,5674685.024414],[-9451285.747559,5694252.903809],[-9470853.626953,5694252.903809],[-9470853.626953,5733388.662598],[-9431717.868164,5752956.541992]]],[[[-9412149.98877,5752956.541992],[-9392582.109375,5752956.541992],[-9392582.109375,5733388.662598],[-9412149.98877,5733388.662598],[-9412149.98877,5752956.541992]]],[[[-9294742.712402,5792092.300781],[-9294742.712402,5772524.421387],[-9333878.471191,5772524.421387],[-9333878.471191,5792092.300781],[-9333878.471191,5772524.421387],[-9294742.712402,5792092.300781]]],[[[-9842643.335449,5909499.577148],[-9842643.335449,5929067.456543],[-9764371.817871,5929067.456543],[-9764371.817871,5909499.577148],[-9725236.059082,5870363.818359],[-9686100.300293,5870363.818359],[-9666532.420898,5850795.938965],[-9646964.541504,5850795.938965],[-9607828.782715,5889931.697754],[-9509989.385742,5889931.697754],[-9490421.506348,5909499.577148],[-9451285.747559,5909499.577148],[-9470853.626953,5870363.818359],[-9451285.747559,5850795.938965],[-9392582.109375,5850795.938965],[-9392582.109375,5870363.818359],[-9392582.109375,5850795.938965],[-9373014.22998,5850795.938965],[-9373014.22998,5811660.180176],[-9353446.350586,5811660.180176],[-9333878.471191,5772524.421387],[-9412149.98877,5772524.421387],[-9412149.98877,5792092.300781],[-9431717.868164,5792092.300781],[-9431717.868164,5752956.541992],[-9470853.626953,5792092.300781],[-9529557.265137,5792092.300781],[-9549125.144531,5772524.421387],[-9607828.782715,5772524.421387],[-9607828.782715,5752956.541992],[-9627396.662109,5752956.541992],[-9646964.541504,5713820.783203],[-9646964.541504,5752956.541992],[-9627396.662109,5752956.541992],[-9666532.420898,5752956.541992],[-9666532.420898,5733388.662598],[-9686100.300293,5733388.662598],[-9686100.300293,5772524.421387],[-9686100.300293,5733388.662598],[-9705668.179688,5733388.662598],[-9744803.938477,5635549.265625],[-9764371.817871,5635549.265625],[-9764371.817871,5674685.024414],[-9783939.697266,5674685.024414],[-9783939.697266,5713820.783203],[-9764371.817871,5713820.783203],[-9803507.57666,5752956.541992],[-9803507.57666,5772524.421387],[-10038322.129395,5831228.05957],[-10038322.129395,5870363.818359],[-10057890.008789,5870363.818359],[-9999186.370605,5909499.577148],[-9960050.611816,5909499.577148],[-9862211.214844,5987771.094727],[-9842643.335449,5909499.577148]]],[[[-9823075.456055,5968203.215332],[-9842643.335449,5948635.335938],[-9862211.214844,5987771.094727],[-9803507.57666,6026906.853516],[-9764371.817871,6026906.853516],[-9764371.817871,6007338.974121],[-9803507.57666,6007338.974121],[-9783939.697266,6007338.974121],[-9823075.456055,5968203.215332]]],[[[-9901346.973633,6085610.491699],[-9920914.853027,6085610.491699],[-9920914.853027,6105178.371094],[-9842643.335449,6144314.129883],[-9862211.214844,6105178.371094],[-9901346.973633,6105178.371094],[-9901346.973633,6085610.491699]]]]},"properties":{"cartodb_id":72,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3562","diss_me":3562,"iso_3166_2":"US-MI","name":"Michigan","name_alt":"MI|Mich.","code_local":"US26","code_hasc":"US.MI","region":"Midwest","region_big":"East North Central","gadm_level":1,"abbrev":"Mich.","postal":"MI","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-8257645.104492,4950673.486816],[-8257645.104492,4970241.366211],[-8238077.225098,4970241.366211],[-8238077.225098,4950673.486816],[-8257645.104492,4950673.486816]]],[[[-8081534.189941,5009377.125],[-8042398.431152,5009377.125],[-8042398.431152,5028945.004395],[-8022830.551758,5028945.004395],[-8022830.551758,5009377.125],[-8003262.672363,5028945.004395],[-8101102.069336,4970241.366211],[-8159805.70752,4970241.366211],[-8198941.466309,4950673.486816],[-8218509.345703,4950673.486816],[-8218509.345703,4970241.366211],[-8238077.225098,4950673.486816],[-8238077.225098,4970241.366211],[-8198941.466309,4989809.245605],[-8198941.466309,5009377.125],[-8081534.189941,5009377.125],[-8042398.431152,5028945.004395],[-8081534.189941,5009377.125]]],[[[-8785977.848145,5322463.195312],[-8785977.848145,5302895.315918],[-8805545.727539,5322463.195312],[-8785977.848145,5322463.195312]]],[[[-8159805.70752,5615981.38623],[-8159805.70752,5498574.109863],[-8179373.586914,5479006.230469],[-8159805.70752,5439870.47168],[-8179373.586914,5400734.712891],[-8159805.70752,5400734.712891],[-8179373.586914,5048512.883789],[-8238077.225098,4970241.366211],[-8238077.225098,4989809.245605],[-8218509.345703,4989809.245605],[-8218509.345703,5028945.004395],[-8238077.225098,5048512.883789],[-8218509.345703,5009377.125],[-8238077.225098,5009377.125],[-8277212.983887,5028945.004395],[-8296780.863281,5068080.763184],[-8355484.501465,5087648.642578],[-8355484.501465,5146352.280762],[-8394620.260254,5165920.160156],[-8883817.245117,5165920.160156],[-8883817.245117,5205055.918945],[-8805545.727539,5244191.677734],[-8805545.727539,5263759.557129],[-8785977.848145,5263759.557129],[-8785977.848145,5322463.195312],[-8805545.727539,5322463.195312],[-8805545.727539,5361598.954102],[-8727274.209961,5361598.954102],[-8707706.330566,5381166.833496],[-8668570.571777,5361598.954102],[-8531595.416016,5361598.954102],[-8531595.416016,5381166.833496],[-8472891.777832,5400734.712891],[-8492459.657227,5400734.712891],[-8472891.777832,5400734.712891],[-8472891.777832,5420302.592285],[-8492459.657227,5420302.592285],[-8492459.657227,5439870.47168],[-8472891.777832,5439870.47168],[-8472891.777832,5479006.230469],[-8492459.657227,5479006.230469],[-8492459.657227,5498574.109863],[-8433756.019043,5518141.989258],[-8433756.019043,5537709.868652],[-8355484.501465,5615981.38623],[-8159805.70752,5615981.38623]]]]},"properties":{"cartodb_id":84,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3559","diss_me":3559,"iso_3166_2":"US-NY","name":"New York","name_alt":"NY|N.Y.","code_local":"US36","code_hasc":"US.NY","region":"Northeast","region_big":"Middle Atlantic","gadm_level":1,"abbrev":"N.Y.","postal":"NY","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-8962088.762695,4950673.486816],[-8981656.64209,4950673.486816],[-9001224.521484,4813698.331055],[-9040360.280273,4794130.45166],[-9040360.280273,4774562.572266],[-9079496.039062,4774562.572266],[-9079496.039062,4754994.692871],[-9099063.918457,4754994.692871],[-9099063.918457,4715858.934082],[-9138199.677246,4715858.934082],[-9177335.436035,4637587.416504],[-9196903.31543,4637587.416504],[-9216471.194824,4676723.175293],[-9333878.471191,4676723.175293],[-9373014.22998,4696291.054688],[-9392582.109375,4735426.813477],[-9451285.747559,4735426.813477],[-9451285.747559,4833266.210449],[-9431717.868164,4872401.969238],[-9431717.868164,5107216.521973],[-9412149.98877,5126784.401367],[-9275174.833008,5126784.401367],[-9275174.833008,5107216.521973],[-9236039.074219,5087648.642578],[-9216471.194824,5087648.642578],[-9216471.194824,5107216.521973],[-9216471.194824,5087648.642578],[-9196903.31543,5087648.642578],[-9236039.074219,5087648.642578],[-9236039.074219,5068080.763184],[-9236039.074219,5087648.642578],[-9196903.31543,5087648.642578],[-9177335.436035,5068080.763184],[-9157767.556641,5087648.642578],[-9079496.039062,5087648.642578],[-9040360.280273,5126784.401367],[-8962088.762695,5165920.160156],[-8962088.762695,4950673.486816]]]]},"properties":{"cartodb_id":85,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3550","diss_me":3550,"iso_3166_2":"US-OH","name":"Ohio","name_alt":"OH|Ohio","code_local":"US39","code_hasc":"US.OH","region":"Midwest","region_big":"East North Central","gadm_level":1,"abbrev":"Ohio","postal":"OH","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}},{"type":"Feature","geometry":{"type":"MultiPolygon","coordinates":[[[[-9686100.300293,5655117.14502],[-9686100.300293,5635549.265625],[-9686100.300293,5655117.14502],[-9686100.300293,5635549.265625],[-9705668.179688,5635549.265625],[-9725236.059082,5596413.506836],[-9725236.059082,5635549.265625],[-9705668.179688,5635549.265625],[-9686100.300293,5674685.024414],[-9686100.300293,5655117.14502]]],[[[-9666532.420898,5674685.024414],[-9686100.300293,5674685.024414],[-9686100.300293,5694252.903809],[-9666532.420898,5694252.903809],[-9666532.420898,5674685.024414]]],[[[-10097025.767578,5909499.577148],[-10116593.646973,5909499.577148],[-10077457.888184,5929067.456543],[-10077457.888184,5909499.577148],[-10097025.767578,5909499.577148]]],[[[-10097025.767578,5929067.456543],[-10116593.646973,5909499.577148],[-10116593.646973,5870363.818359],[-10097025.767578,5889931.697754],[-10077457.888184,5870363.818359],[-10038322.129395,5870363.818359],[-10038322.129395,5831228.05957],[-9920914.853027,5811660.180176],[-9920914.853027,5792092.300781],[-9842643.335449,5792092.300781],[-9842643.335449,5772524.421387],[-9803507.57666,5772524.421387],[-9803507.57666,5752956.541992],[-9764371.817871,5713820.783203],[-9783939.697266,5713820.783203],[-9783939.697266,5674685.024414],[-9764371.817871,5674685.024414],[-9764371.817871,5635549.265625],[-9744803.938477,5635549.265625],[-9783939.697266,5615981.38623],[-9783939.697266,5576845.627441],[-9803507.57666,5576845.627441],[-9803507.57666,5557277.748047],[-9764371.817871,5557277.748047],[-9764371.817871,5596413.506836],[-9725236.059082,5596413.506836],[-9725236.059082,5557277.748047],[-9744803.938477,5537709.868652],[-9744803.938477,5479006.230469],[-9764371.817871,5479006.230469],[-9764371.817871,5400734.712891],[-9783939.697266,5381166.833496],[-9783939.697266,5283327.436523],[-9764371.817871,5283327.436523],[-9783939.697266,5244191.677734],[-10097025.767578,5244191.677734],[-10097025.767578,5263759.557129],[-10116593.646973,5263759.557129],[-10136161.526367,5302895.315918],[-10155729.405762,5302895.315918],[-10155729.405762,5342031.074707],[-10136161.526367,5361598.954102],[-10155729.405762,5361598.954102],[-10155729.405762,5439870.47168],[-10194865.164551,5479006.230469],[-10214433.043945,5479006.230469],[-10234000.92334,5518141.989258],[-10253568.802734,5518141.989258],[-10273136.682129,5557277.748047],[-10312272.440918,5557277.748047],[-10331840.320312,5576845.627441],[-10331840.320312,5674685.024414],[-10312272.440918,5674685.024414],[-10331840.320312,5752956.541992],[-10292704.561523,5792092.300781],[-10273136.682129,5792092.300781],[-10273136.682129,5889931.697754],[-10253568.802734,5889931.697754],[-10253568.802734,5909499.577148],[-10253568.802734,5889931.697754],[-10214433.043945,5889931.697754],[-10155729.405762,5929067.456543],[-10097025.767578,5929067.456543]]]]},"properties":{"cartodb_id":98,"featurecla":"Admin-1 scale rank","adm1_code":"USA-3553","diss_me":3553,"iso_3166_2":"US-WI","name":"Wisconsin","name_alt":"WI|Wis.","code_local":"US55","code_hasc":"US.WI","region":"Midwest","region_big":"East North Central","gadm_level":1,"abbrev":"Wis.","postal":"WI","labelrank":0,"created_at":"2014-09-10T00:00:00Z","updated_at":"2014-09-10T00:00:00Z"}}]}';
		features = JSON.parse(features);
		var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.renderer.render(svg, features, {x: 2, y: 2, zoom: 3});
		expect(svg.children[0].children.length).toEqual(15);
	});

	it("webmercator coordinates should be transformed to tile pixels", function(){

	});

});