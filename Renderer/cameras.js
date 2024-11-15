////////////////////////////////////////////////////
///// CAMERAS

function FollowFromUpCamera(){
	/* the only data it needs is the position of the camera */
	this.frame = new Matrix4();

	/* update the camera with the current car position */
	this.update = function(car_frame){
		this.frame = this.frame.set(car_frame);
	}

	/* return the transformation matrix to transform from world coordiantes to the view reference frame */
	this.matrix = function(){
		let eyePoint = new Vector3([0, 50, 0]);
		let lookAtPoint = new Vector3([0, 0, 0]);
		let upDirection = new Vector4([0, 0, -1, 0]);

		eyePoint = this.frame.multiplyVector3(eyePoint);
		lookAtPoint = this.frame.multiplyVector3(lookAtPoint);
		upDirection = this.frame.multiplyVector4(upDirection);

		let e = eyePoint.elements;
		let l = lookAtPoint.elements;
		let u = upDirection.elements;

		outMatrix = new Matrix4();
		outMatrix.setLookAt(
			e[0], e[1], e[2],
			l[0], l[1], l[2],
			u[0], u[1], u[2],
		);
		outMatrix.eye = e;
		return outMatrix;
	}
}



function ChaseCamera(){
	/* the only data it needs is the frame of the camera */
	this.frame = new Matrix4();

	/* camera parameters */
	this.eyePoint = [0, 2.5, 10];
	this.lookAtPoint = [0, 0, 0];

	this.reset = function(){
		this.eyePoint = [0, 2.5, 10];
		this.lookAtPoint = [0, 0, 0];
	}

	this.move = function(offX, offY){
		this.eyePoint = [this.eyePoint[0] + offX, this.eyePoint[1] + offY, this.eyePoint[2]];
	}

	this.chdir = function(offX, offY){
		this.lookAtPoint = [this.lookAtPoint[0] + offX, this.lookAtPoint[1] + offY, this.lookAtPoint[2]];
	}

	this.rearView = function(){
		this.eyePoint[2] = -this.eyePoint[2];
	}

	/* update the camera with the current car position */
	this.update = function(car_frame){
		this.frame = this.frame.set(car_frame);
	}

	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function(){
		let eyePoint = new Vector3(this.eyePoint);
		let lookAtPoint = new Vector3(this.lookAtPoint);
		let upDirection = [0, 1, 0]

		eyePoint = this.frame.multiplyVector3(eyePoint);
		lookAtPoint = this.frame.multiplyVector3(lookAtPoint);

		let e = eyePoint.elements;
		let l = lookAtPoint.elements;
		let u = upDirection;

		outMatrix = new Matrix4();
		outMatrix.setLookAt(
			e[0], e[1], e[2],
			l[0], l[1], l[2],
			u[0], u[1], u[2],
		);
		outMatrix.eye = e;
		return outMatrix;
	}
}



function RightLightCamera(){
	/* the only data it needs is the frame of the camera */
	this.frame = new Matrix4();

	/* update the camera with the current car position */
	this.update = function(car_frame){
		this.frame = this.frame.set(car_frame);
	}

	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function(){
		let eyePoint = new Vector3([0.65, 0.65, -1.6]);
		let lookAtPoint = new Vector3([0.65, 0.65, -10]);
		let upDirection = [0, 1, 0]

		eyePoint = this.frame.multiplyVector3(eyePoint);
		lookAtPoint = this.frame.multiplyVector3(lookAtPoint);

		let e = eyePoint.elements;
		let l = lookAtPoint.elements;
		let u = upDirection;

		outMatrix = new Matrix4();
		outMatrix.setLookAt(
			e[0], e[1], e[2],
			l[0], l[1], l[2],
			u[0], u[1], u[2],
		);
		outMatrix.eye = e;
		return outMatrix;
	}
}



function LeftLightCamera(){
	/* the only data it needs is the frame of the camera */
	this.frame = new Matrix4();

	/* update the camera with the current car position */
	this.update = function(car_frame){
		this.frame = this.frame.set(car_frame);
	}

	/* return the transformation matrix to transform from worlod coordiantes to the view reference frame */
	this.matrix = function(){
		let eyePoint = new Vector3([-0.65, 0.65, -1.6]);
		let lookAtPoint = new Vector3([-0.65, 0.65, -10]);
		let upDirection = [0, 1, 0]

		eyePoint = this.frame.multiplyVector3(eyePoint);
		lookAtPoint = this.frame.multiplyVector3(lookAtPoint);

		let e = eyePoint.elements;
		let l = lookAtPoint.elements;
		let u = upDirection;

		outMatrix = new Matrix4();
		outMatrix.setLookAt(
			e[0], e[1], e[2],
			l[0], l[1], l[2],
			u[0], u[1], u[2],
		);
		outMatrix.eye = e;
		return outMatrix;
	}
}



function update_camera(value){
  currentCamera = value;
  if (currentCamera == 1)
  	cameras[currentCamera].reset();
}