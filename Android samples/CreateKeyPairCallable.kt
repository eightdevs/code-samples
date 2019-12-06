package bitfreezer.app.wallet.async_methods

import bitfreezer.app.wallet.enums.Coins
import bitfreezer.app.wallet.extensions.log
import bitfreezer.app.wallet.extensions.toBase58
import bitfreezer.app.wallet.utils.Utils
import com.quincysx.crypto.CoinTypes
import com.quincysx.crypto.bip32.ExtendedKey
import com.quincysx.crypto.bip44.AddressIndex
import com.quincysx.crypto.bip44.BIP44
import com.quincysx.crypto.bip44.CoinPairDerive
import io.github.novacrypto.bip39.SeedCalculator
import io.github.novacrypto.bip39.Words
import java.security.SecureRandom
import java.util.concurrent.Callable


class CreateKeyPairCallable(private val selectedCurrency: String) : Callable<HashMap<String, String>> {

    private lateinit var coinType: CoinTypes

    override fun call(): HashMap<String, String> {
        return createKeyPair()
    }

    private fun createKeyPair(): HashMap<String, String> {
        val stringBuilder = StringBuilder()
        val entropy = ByteArray(Words.TWELVE.byteLength())
        SecureRandom().nextBytes(entropy)

        Utils.fillMnemonic(entropy, stringBuilder)

        when (selectedCurrency) {
            Coins.ETHEREUM -> coinType = CoinTypes.Ethereum
            Coins.BITCOIN -> coinType = CoinTypes.Bitcoin
            Coins.BITCOIN_CASH -> coinType = CoinTypes.BitcoinCash
            else -> log("No currency")
        }

        val address: AddressIndex = BIP44.m().purpose44().coinType(coinType).account(0).external().address(0)
        val seed = SeedCalculator().calculateSeed(stringBuilder.toString(), "")

        val extendedKey = ExtendedKey.create(seed)
        val coinKeyPair = CoinPairDerive(extendedKey)
        val master = coinKeyPair.derive(address)

        return hashMapOf("entropy" to entropy.toBase58(),"mnemonic" to stringBuilder.toString(), "privateKey" to master.privateKey, "publicKey" to master.publicKey, "address" to master.address)
    }

}

