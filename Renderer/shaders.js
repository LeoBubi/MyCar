function ShadowShader(gl){
	var VSHADER_SOURCE =
		`attribute vec4 a_Position;
		uniform mat4 u_ProjMatrix;
		uniform mat4 u_MvMatrix;
		void main(){
			gl_Position = u_ProjMatrix * u_MvMatrix * a_Position;
		}`;

	var FSHADER_SOURCE =
		`precision highp float;
		void main(){
			const vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
			const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
			vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);
			rgbaDepth -= rgbaDepth.gbaa * bitMask;
			rgbaDepth.a = 1.0;
			gl_FragColor = rgbaDepth;
		}`;

	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, VSHADER_SOURCE);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, FSHADER_SOURCE);
	gl.compileShader(fragmentShader);

	// create shader program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// if creating the shader program failed, alert
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
		str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}

	program.a_Position_Loc = gl.getAttribLocation(program, "a_Position");
	program.u_ProjMatrix_Loc = gl.getUniformLocation(program, "u_ProjMatrix");
	program.u_MvMatrix_Loc = gl.getUniformLocation(program, "u_MvMatrix");

	return program;
}











function ContextShader(gl){

	// HL -> headlight

	var VSHADER_SOURCE =
		`attribute vec4 a_Position;
		attribute vec4 a_Normal;
		attribute vec2 a_TexCoord;
		uniform mat4 u_ModMatrix;
		uniform mat4 u_MvMatrix;
		uniform mat4 u_MvMatrix_RightHL;
		uniform mat4 u_MvMatrix_LeftHL;
		uniform mat4 u_ProjMatrix;
		uniform mat4 u_ProjMatrix_HL;
		uniform mat4 u_NormalMatrix;
		varying vec3 v_Normal;
		varying vec3 v_VtxPosition;
		varying vec2 v_TexCoord;
		varying vec4 v_Position_RightHL;
		varying vec4 v_Position_LeftHL;
		void main(){
			gl_Position = u_ProjMatrix * u_MvMatrix * a_Position;
			v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
			v_VtxPosition = vec3(u_ModMatrix * a_Position);
			v_TexCoord = a_TexCoord;
			v_Position_RightHL = u_ProjMatrix_HL * u_MvMatrix_RightHL * a_Position;
			v_Position_LeftHL = u_ProjMatrix_HL * u_MvMatrix_LeftHL * a_Position;
		}`;

	var FSHADER_SOURCE =
		`precision highp float;
		varying vec3 v_Normal;
		varying vec3 v_VtxPosition;
		varying vec2 v_TexCoord;
		varying vec4 v_Position_RightHL;
		varying vec4 v_Position_LeftHL;
		uniform sampler2D u_ColorMap;
		uniform sampler2D u_NormalMap;
		uniform sampler2D u_HLTexture;
		uniform sampler2D u_ShadowMap_RightHL;
		uniform sampler2D u_ShadowMap_LeftHL;
		uniform int u_ReadNormalMap;
		uniform float u_DiffFactor;
		uniform float u_SpecFactor;
		uniform vec3 u_EyePosition;
		uniform vec3 u_LampPosition[12];
		uniform float u_LampIntAngle;
		uniform float u_LampExtAngle;
		uniform vec3 u_LampColor;
		uniform vec3 u_SunColor;
		uniform vec3 u_SunDirection;
		uniform vec3 u_AmbientColor;
		uniform float u_LightsOn;


	////////////////////////////////////////////////////////////// auxiliary functions

		float unpackDepth(const in vec4 rgbaDepth){
			const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
			float depth = dot(rgbaDepth, bitShift);
			return depth;
		}

		vec3 lightRefl(vec4 color, vec3 viewDirection, vec3 normal, vec3 lightDirection, vec3 lightColor){
			vec3 halfwayVector = normalize(lightDirection + viewDirection);
			float diffDotP = max(dot(lightDirection, normal), 0.0);
			float specDotP = max(dot(normal, halfwayVector), 0.0);
			vec3 diffRefl = lightColor * vec3(color) * diffDotP * u_DiffFactor;
			vec3 specRefl = lightColor * vec3(color) * specDotP * u_SpecFactor;
			return (diffRefl + specRefl);
		}

		float far = 100.0;
		float zFactor(float depth){
			float z = depth * 2.0 - 1.0;
			float linearZ = (2.0 * 1.0 * far) / (far + 1.0 - z * (far - 1.0));
			return pow(1.0 - linearZ / far, 3.5);
		}

	//////////////////////////////////////////////////////////////


		void main(){
			#define PI 3.1415926538
			float rad2deg = 180.0 / PI;
			float colorFactor;
			vec3 texNormal;
			vec3 rightHLCoord;
			vec3 leftHLCoord;
			vec3 lightDirection;
			vec3 rightLight;
			vec3 leftLight;


			////////////////////////////////////////
			//////////////////////////////////////// texture mapping
			////////////////////////////////////////

			vec4 texColor = texture2D(u_ColorMap, v_TexCoord);
			if (u_ReadNormalMap == 1)
				texNormal = texture2D(u_NormalMap, v_TexCoord).xyz;
			else
				texNormal = vec3(0.0, 0.0, 0.0);


			////////////////////////////////////////
			//////////////////////////////////////// headlights
			////////////////////////////////////////

			if (v_Position_RightHL.w > 0.0)
				rightHLCoord = (v_Position_RightHL.xyz / v_Position_RightHL.w) / 2.0 + 0.5;
			else
				rightHLCoord = vec3(0.0, 0.0, 1.0);

			if (rightHLCoord.x < 0.0 || rightHLCoord.x > 1.0 || rightHLCoord.y < 0.0 || rightHLCoord.y > 1.0)
				rightHLCoord = vec3(0.0, 0.0, 1.0);

			vec4 rightHLColor = texture2D(u_HLTexture, rightHLCoord.xy);

			/******************************/

			if (v_Position_LeftHL.w > 0.0)
				leftHLCoord = (v_Position_LeftHL.xyz / v_Position_LeftHL.w) / 2.0 + 0.5;
			else
				leftHLCoord = vec3(0.0, 0.0, 1.0);

			if (leftHLCoord.x < 0.0 || leftHLCoord.x > 1.0 || leftHLCoord.y < 0.0 || leftHLCoord.y > 1.0)
				leftHLCoord = vec3(0.0, 0.0, 1.0);

			vec4 leftHLColor = texture2D(u_HLTexture, leftHLCoord.xy);


			////////////////////////////////////////
			//////////////////////////////////////// shadow mapping
			////////////////////////////////////////

			if (rightHLCoord.z > unpackDepth(texture2D(u_ShadowMap_RightHL, rightHLCoord.xy)) + 0.0015)
				rightLight = vec3(0.0, 0.0, 0.0);
			else
				rightLight = rightHLColor.rgb * rightHLColor.a * 0.5;

			/******************************/

			if (leftHLCoord.z > unpackDepth(texture2D(u_ShadowMap_LeftHL, leftHLCoord.xy)) + 0.0015)
				leftLight = vec3(0.0, 0.0, 0.0);
			else
				leftLight = leftHLColor.rgb * leftHLColor.a * 0.5;


			////////////////////////////////////////
			//////////////////////////////////////// sun and street lamps
			////////////////////////////////////////

			vec3 viewDirection = normalize(u_EyePosition - v_VtxPosition);
			vec3 normal = normalize(normalize(v_Normal) + texNormal);
			vec3 ambRefl = u_AmbientColor * vec3(texColor);
			vec3 reflection = lightRefl(texColor, viewDirection, normal, u_SunDirection, u_SunColor);

			for (int i = 0; i < 12; ++i){
				lightDirection = normalize(u_LampPosition[i] - v_VtxPosition);
				float lightAngle = acos(max(dot(lightDirection, vec3(0.0, 1.0, 0.0)), 0.0)) * rad2deg;
				if (lightAngle <= u_LampIntAngle) {
					colorFactor = 1.0;
				}
				else if (lightAngle <= u_LampExtAngle) {
					colorFactor = 1.0 - (lightAngle - u_LampIntAngle) / (u_LampExtAngle - u_LampIntAngle);
				}
				else {
					colorFactor = 0.0;
				}
				reflection += lightRefl(texColor, viewDirection, normal, lightDirection, u_LampColor * colorFactor * u_LightsOn);
			}

			////////////////////////////////////////
			//////////////////////////////////////// final color
			////////////////////////////////////////

			gl_FragColor = vec4(reflection + ambRefl + (rightLight * zFactor(rightHLCoord.z) + leftLight * zFactor(leftHLCoord.z)) * u_LightsOn, texColor.a);
		}`;

	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, VSHADER_SOURCE);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, FSHADER_SOURCE);
	gl.compileShader(fragmentShader);

	// create shader program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// if creating the shader program failed, alert
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
		str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}

	program.a_Position_Loc = gl.getAttribLocation(program, "a_Position");
	program.a_Normal_Loc = gl.getAttribLocation(program, "a_Normal");
	program.a_TexCoord_Loc = gl.getAttribLocation(program, "a_TexCoord");
	program.u_ModMatrix_Loc = gl.getUniformLocation(program, "u_ModMatrix");
	program.u_MvMatrix_Loc = gl.getUniformLocation(program, "u_MvMatrix");
	program.u_MvMatrix_RightHL_Loc = gl.getUniformLocation(program, "u_MvMatrix_RightHL");
	program.u_MvMatrix_LeftHL_Loc = gl.getUniformLocation(program, "u_MvMatrix_LeftHL");
	program.u_ProjMatrix_Loc = gl.getUniformLocation(program, "u_ProjMatrix");
	program.u_ProjMatrix_HL_Loc = gl.getUniformLocation(program, "u_ProjMatrix_HL");
	program.u_NormalMatrix_Loc = gl.getUniformLocation(program, "u_NormalMatrix");
	program.u_ColorMap_Loc = gl.getUniformLocation(program, "u_ColorMap");
	program.u_NormalMap_Loc = gl.getUniformLocation(program, "u_NormalMap");
	program.u_HLTexture_Loc = gl.getUniformLocation(program, "u_HLTexture");
	program.u_ShadowMap_RightHL_Loc = gl.getUniformLocation(program, "u_ShadowMap_RightHL");
	program.u_ShadowMap_LeftHL_Loc = gl.getUniformLocation(program, "u_ShadowMap_LeftHL");
	program.u_ReadNormalMap_Loc = gl.getUniformLocation(program, "u_ReadNormalMap");
	program.u_DiffFactor_Loc = gl.getUniformLocation(program, "u_DiffFactor");
	program.u_SpecFactor_Loc = gl.getUniformLocation(program, "u_SpecFactor");
	program.u_EyePosition_Loc = gl.getUniformLocation(program, "u_EyePosition");
	program.u_LampPosition_Loc = gl.getUniformLocation(program, "u_LampPosition");
	program.u_LampIntAngle_Loc = gl.getUniformLocation(program, "u_LampIntAngle");
	program.u_LampExtAngle_Loc = gl.getUniformLocation(program, "u_LampExtAngle");
	program.u_LampColor_Loc = gl.getUniformLocation(program, "u_LampColor");
	program.u_SunColor_Loc = gl.getUniformLocation(program, "u_SunColor");
	program.u_SunDirection_Loc = gl.getUniformLocation(program, "u_SunDirection");
	program.u_AmbientColor_Loc = gl.getUniformLocation(program, "u_AmbientColor");
	program.u_LightsOn_Loc = gl.getUniformLocation(program, "u_LightsOn");

	return program;
}




























function CarShader(gl){

	var VSHADER_SOURCE =
		`attribute vec4 a_Position;
		attribute vec4 a_Normal;
		uniform mat4 u_ModMatrix;
		uniform mat4 u_MvMatrix;
		uniform mat4 u_ProjMatrix;
		uniform mat4 u_NormalMatrix;
		varying vec3 v_Normal;
		varying vec3 v_VtxPosition;
		void main(){
			gl_Position = u_ProjMatrix * u_MvMatrix * a_Position;
			v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));
			v_VtxPosition = vec3(u_ModMatrix * a_Position);
		}`;

	var FSHADER_SOURCE =
		`precision highp float;
		varying vec3 v_Normal;
		varying vec3 v_VtxPosition;
		uniform vec4 u_Color;
		uniform float u_DiffFactor;
		uniform float u_SpecFactor;
		uniform vec3 u_EyePosition;
		uniform vec3 u_LampPosition[12];
		uniform float u_LampIntAngle;
		uniform float u_LampExtAngle;
		uniform vec3 u_LampColor;
		uniform vec3 u_SunColor;
		uniform vec3 u_SunDirection;
		uniform vec3 u_AmbientColor;
		uniform float u_LightsOn;

		vec3 lightRefl(vec3 viewDirection, vec3 normal, vec3 lightDirection, vec3 lightColor){
			vec3 halfwayVector = normalize(lightDirection + viewDirection);
			float diffDotP = max(dot(lightDirection, normal), 0.0);
			float specDotP = max(dot(normal, halfwayVector), 0.0);
			vec3 diffRefl = lightColor * vec3(u_Color) * diffDotP * u_DiffFactor;
			vec3 specRefl = lightColor * vec3(u_Color) * specDotP * u_SpecFactor;
			return (diffRefl + specRefl);
		}

		void main(){
			#define PI 3.1415926538
			float rad2deg = 180.0 / PI;
			float colorFactor;

			vec3 viewDirection = normalize(u_EyePosition - v_VtxPosition);
			vec3 normal = normalize(v_Normal);
			vec3 ambRefl = u_AmbientColor * vec3(u_Color);
			vec3 reflection = lightRefl(viewDirection, normal, u_SunDirection, u_SunColor);
			vec3 lightDirection;
			for (int i = 0; i < 12; ++i){
				lightDirection = normalize(u_LampPosition[i] - v_VtxPosition);
				float lightAngle = acos(max(dot(lightDirection, vec3(0.0, 1.0, 0.0)), 0.0)) * rad2deg;
				if (lightAngle <= u_LampIntAngle) {
					colorFactor = 1.0;
				}
				else if (lightAngle <= u_LampExtAngle) {
					colorFactor = 1.0 - (lightAngle - u_LampIntAngle) / (u_LampExtAngle - u_LampIntAngle);
				}
				else {
					colorFactor = 0.0;
				}
				reflection += lightRefl(viewDirection, normal, lightDirection, u_LampColor * colorFactor * u_LightsOn);
			}
			gl_FragColor = vec4(reflection + ambRefl, u_Color.a);
		}`;

	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, VSHADER_SOURCE);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, FSHADER_SOURCE);
	gl.compileShader(fragmentShader);

	// create shader program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// if creating the shader program failed, alert
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
		str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}

	program.a_Position_Loc = gl.getAttribLocation(program, "a_Position");
	program.a_Normal_Loc = gl.getAttribLocation(program, "a_Normal");
	program.u_ModMatrix_Loc = gl.getUniformLocation(program, "u_ModMatrix");
	program.u_MvMatrix_Loc = gl.getUniformLocation(program, "u_MvMatrix");
	program.u_ProjMatrix_Loc = gl.getUniformLocation(program, "u_ProjMatrix");
	program.u_NormalMatrix_Loc = gl.getUniformLocation(program, "u_NormalMatrix");
	program.u_Color_Loc = gl.getUniformLocation(program, "u_Color");
	program.u_DiffFactor_Loc = gl.getUniformLocation(program, "u_DiffFactor");
	program.u_SpecFactor_Loc = gl.getUniformLocation(program, "u_SpecFactor");
	program.u_EyePosition_Loc = gl.getUniformLocation(program, "u_EyePosition");
	program.u_LampPosition_Loc = gl.getUniformLocation(program, "u_LampPosition");
	program.u_LampIntAngle_Loc = gl.getUniformLocation(program, "u_LampIntAngle");
	program.u_LampExtAngle_Loc = gl.getUniformLocation(program, "u_LampExtAngle");
	program.u_LampColor_Loc = gl.getUniformLocation(program, "u_LampColor");
	program.u_SunColor_Loc = gl.getUniformLocation(program, "u_SunColor");
	program.u_SunDirection_Loc = gl.getUniformLocation(program, "u_SunDirection");
	program.u_AmbientColor_Loc = gl.getUniformLocation(program, "u_AmbientColor");
	program.u_LightsOn_Loc = gl.getUniformLocation(program, "u_LightsOn");

	return program;
}



function CarLightsShader(gl){
	var VSHADER_SOURCE =
		`attribute vec4 a_Position;
		uniform mat4 u_MvMatrix;
		uniform mat4 u_ProjMatrix;
		void main(){
			gl_Position = u_ProjMatrix * u_MvMatrix * a_Position;
		}`;

	var FSHADER_SOURCE =
		`precision highp float;
		uniform vec4 u_Color;
		void main(){
			gl_FragColor = u_Color;
		}`;

	// create the vertex shader
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, VSHADER_SOURCE);
	gl.compileShader(vertexShader);

	// create the fragment shader
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, FSHADER_SOURCE);
	gl.compileShader(fragmentShader);

	// create shader program
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// if creating the shader program failed, alert
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		var str = "Unable to initialize the shader program.\n\n";
		str += "VS:\n" + gl.getShaderInfoLog(vertexShader) + "\n\n";
		str += "FS:\n" + gl.getShaderInfoLog(fragmentShader) + "\n\n";
		str += "PROG:\n" + gl.getProgramInfoLog(shaderProgram);
		alert(str);
	}

	program.a_Position_Loc = gl.getAttribLocation(program, "a_Position");
	program.u_MvMatrix_Loc = gl.getUniformLocation(program, "u_MvMatrix");
	program.u_ProjMatrix_Loc = gl.getUniformLocation(program, "u_ProjMatrix");
	program.u_Color_Loc = gl.getUniformLocation(program, "u_Color");

	return program;
}