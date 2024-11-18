import pgp from "pg-promise";
import {Router} from "express";

const router = Router();
router.get("/getAccount/:account_id", async function (req, res) {
	const account_id = req.params.account_id
	const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	try {
		const [accountData] = await connection.query("select * from ccca.account where account_id = $1", [account_id]);
		if (!accountData) {
			throw new Error("User not exists");
		}
		const result = {
			accountData
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

export default router
