import crypto from "crypto";
import pgp from "pg-promise";
import express from "express";
import { validateCpf } from "./validateCpf";

const app = express();
app.use(express.json());

const nameIsValid = (name: string) => {
	return name.match(/[a-zA-Z] [a-zA-Z]+/);
}
const emailIsValid = (email: string) => {
	return email.match(/^(.+)@(.+)$/);
}
const carPlateIsValid = (carPlate: string) => {
	return carPlate.match(/[A-Z]{3}[0-9]{4}/)
}

app.post("/signup", async function (req, res) {
	const {
		name,
		email,
		cpf,
		carPlate,
		password,
		isPassager,
		isDriver
	} = req.body;
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	try {
		const id = crypto.randomUUID();
		const [userExist] = await connection.query("select * from ccca.account where email = $1", [email]);
		if (userExist) {
			throw new Error("User already exists");
		}
		if (!nameIsValid(name)) {
			throw new Error("Invalid name");
		}
		if (!emailIsValid(email)) {
			throw new Error("Invalid email");
		}
		if (!validateCpf(cpf)) {
			throw new Error("Invalid cpf");
		}
		if (isDriver) {
			if (!carPlateIsValid(carPlate)) {
				throw new Error("Invalid Car Plate");
			}
		}
		const arrayDataForRegister = [
			id,
			name,
			email,
			cpf,
			carPlate,
			!!isPassager,
			!!isDriver,
			password
		]
		await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)",arrayDataForRegister);
		const result = {
			accountId: id
		}
		res.status(200).json({ message: result });
	} catch(error){
		if(error instanceof Error){
			res.status(422).json({ message: error.message });
		}
	} finally {
		await connection.$pool.end();
	}
});

app.listen(3000);
