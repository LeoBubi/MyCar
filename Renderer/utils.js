////////////////////////////////////////////////////
///// UTILITY FUNCTIONS

function initializeObjects(cylinderFaces){
	Game.setScene(scene_0);

	car = new MyCar();
	createCarBuffers(car);
	car.utils = Game.addCar("mycar");

	cylinder = new Cylinder(cylinderFaces);
	ComputeNormals(cylinder);
	createObjectBuffers(cylinder);

	ComputeNormals(Game.scene.trackObj);
	createObjectBuffers(Game.scene.trackObj);

	ComputeNormals(Game.scene.groundObj);
	createObjectBuffers(Game.scene.groundObj);

	for (var i = 0; i < Game.scene.buildings.length; ++i){
		ComputeNormals(Game.scene.buildingsObjTex[i]);
		ComputeNormals(Game.scene.buildingsObjTex[i].roof);
		createObjectBuffers(Game.scene.buildingsObjTex[i]);
		createObjectBuffers(Game.scene.buildingsObjTex[i].roof);
	}
}



function createObjectBuffers(obj){
	obj.vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, obj.vertices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	if (obj.normals) {
		obj.normalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.normals, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	if (obj.texCoords) {
		obj.texCoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, obj.texCoords, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	obj.indexBufferTriangles = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, obj.triangleIndices, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}



function drawObject(program, obj, fillColor){
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(program.a_Position_Loc);
	gl.vertexAttribPointer(program.a_Position_Loc, 3, gl.FLOAT, false, 0, 0);

	if (obj.normalBuffer){
		gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
		gl.enableVertexAttribArray(program.a_Normal_Loc);
		gl.vertexAttribPointer(program.a_Normal_Loc, 3, gl.FLOAT, false, 0, 0);
	}

	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);

	gl.uniform4fv(program.u_Color_Loc, fillColor);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.disable(gl.POLYGON_OFFSET_FILL);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.disableVertexAttribArray(program.a_Position_Loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}



function drawTexObject(program, obj, colorUnit, normalUnit){
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(program.a_Position_Loc);
	gl.vertexAttribPointer(program.a_Position_Loc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.normalBuffer);
	gl.enableVertexAttribArray(program.a_Normal_Loc);
	gl.vertexAttribPointer(program.a_Normal_Loc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
	gl.enableVertexAttribArray(program.a_TexCoord_Loc);
	gl.vertexAttribPointer(program.a_TexCoord_Loc, 2, gl.FLOAT, false, 0, 0);

	gl.enable(gl.POLYGON_OFFSET_FILL);
	gl.polygonOffset(1.0, 1.0);

	gl.uniform1i(program.u_ColorMap_Loc, colorUnit);
	
	if (normalUnit) {
		gl.uniform1i(program.u_ReadNormalMap_Loc, 1);
		gl.uniform1i(program.u_NormalMap_Loc, normalUnit);
	}
	else
		gl.uniform1i(program.u_ReadNormalMap_Loc, 0);

	gl.uniform1i(program.u_HLTexture_Loc, 7);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.disable(gl.POLYGON_OFFSET_FILL);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.disableVertexAttribArray(program.a_Position_Loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}



function drawObject_ShadowMap(program, obj){
	gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertexBuffer);
	gl.enableVertexAttribArray(program.a_Position_Loc);
	gl.vertexAttribPointer(program.a_Position_Loc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indexBufferTriangles);
	gl.drawElements(gl.TRIANGLES, obj.triangleIndices.length, gl.UNSIGNED_SHORT, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	gl.disableVertexAttribArray(program.a_Position_Loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
}



/********************************************************************/
//////////////////////////////////////////////////////////////////////
/********************************************************************/
//////////////////////////////////////////////////////////////////////
/********************************************************************/



function setLightRefl(diffUniformLoc, specUniformLoc, diffFactor, specFactor){
	gl.uniform1f(diffUniformLoc, diffFactor);
	gl.uniform1f(specUniformLoc, specFactor);
}



function setSceneLights(program, lampsCoords){
	gl.useProgram(program);
	gl.uniform3fv(program.u_LampPosition_Loc, lampsCoords);
	gl.uniform1f(program.u_LampIntAngle_Loc, lampIntAngle);
	gl.uniform1f(program.u_LampExtAngle_Loc, lampExtAngle);
	gl.uniform3fv(program.u_LampColor_Loc, lampColor);
	gl.uniform3fv(program.u_SunColor_Loc, sunColor);
	gl.uniform3fv(program.u_AmbientColor_Loc, ambientColor);
	gl.uniform1f(program.u_LightsOn_Loc, lightsOn);
}



function setProjMatrix(program, projMatrix){
	gl.useProgram(program);
	gl.uniformMatrix4fv(program.u_ProjMatrix_Loc, false, projMatrix.elements);
}



function setSunDirection(program){
	gl.useProgram(program);
	gl.uniform3fv(program.u_SunDirection_Loc, Game.scene.weather.sunLightDirection);
}



function setCameraPosition(program){
	gl.useProgram(program);
	gl.uniform3fv(program.u_EyePosition_Loc, viewMatrix.eye);
}



function setTexture(path){
	var img = new Image();
	var tex = gl.createTexture();
	img.src = path;
	img.onload = function(){
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
	}
	return tex;
}



function setPNGTexture(path){
	var img = new Image();
	var tex = gl.createTexture();
	img.src = path;
	img.onload = function(){
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	}
	return tex;
}



function loadTexture(texture, texUnit){
	if(texUnit === 0) gl.activeTexture(gl.TEXTURE0);
	else if (texUnit === 1) gl.activeTexture(gl.TEXTURE1);
	else if (texUnit === 2) gl.activeTexture(gl.TEXTURE2);
	else if (texUnit === 3) gl.activeTexture(gl.TEXTURE3);
	else if (texUnit === 4) gl.activeTexture(gl.TEXTURE4);
	else if (texUnit === 5) gl.activeTexture(gl.TEXTURE5);
	else if (texUnit === 6) gl.activeTexture(gl.TEXTURE6);
	else if (texUnit === 7) gl.activeTexture(gl.TEXTURE7);
	else console.log("loadTexture: INVALID texture unit");
	gl.bindTexture(gl.TEXTURE_2D, texture);
}