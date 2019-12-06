package bitfreezer.app.wallet.fragments.send_fragments

import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import bitfreezer.app.wallet.R
import bitfreezer.app.wallet.async_methods.ParserQrCallable
import bitfreezer.app.wallet.crypto.Address
import bitfreezer.app.wallet.enums.*
import bitfreezer.app.wallet.extensions.*
import bitfreezer.app.wallet.interfaces.LightningOnChainBalanceListener
import bitfreezer.app.wallet.pojo.Key
import bitfreezer.app.wallet.utils.DialogsUtil
import bitfreezer.app.wallet.utils.Utils
import bitfreezer.app.wallet.view_models.BalanceViewModel
import bitfreezer.app.wallet.view_models.CourseViewModel
import bitfreezer.app.wallet.view_models.SendViewModel
import com.google.zxing.integration.android.IntentIntegrator
import com.jakewharton.rxbinding3.widget.textChanges
import io.reactivex.Observable
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.schedulers.Schedulers
import kotlinx.android.synthetic.main.lightning_send_on.*
import org.koin.androidx.viewmodel.ext.android.viewModel
import java.util.concurrent.TimeUnit


class SendOnChainFragment : Fragment() {

    private var onChainBalance: Double? = null
    private var convertedOnChainBalance: Double? = null
    private var convertedCurrency: String? = null

    private var addressOfWallet: String? = null
    private var nameOfWallet: String? = null
    private var idOfWallet: String? = null
    private var token: String? = null
    private var idOfUser: String? = null
    private var publicKeyOfServer: String? = null
    private var parameterP: String? = null
    private var parameterG: String? = null

    private var course: Double? = null
    private var cryptoFocus: Boolean = false
    private var convertedCurrencyFocus: Boolean = false

    private val courseViewModel: CourseViewModel by viewModel()
    private val balanceViewModel: BalanceViewModel by viewModel()
    private val sendViewModel: SendViewModel by viewModel()

    private val compositeDisposable = CompositeDisposable()

    private var feesOfBitcoin = HashMap<String, Int>()
    private var fee: Int? = null

    private lateinit var listener: LightningOnChainBalanceListener
    fun setListener(listener: LightningOnChainBalanceListener){
        this.listener = listener
    }

    private lateinit var mContext: Context
    override fun onAttach(context: Context) {
        super.onAttach(context)
        mContext = context
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.lightning_send_on, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setExtras()
        setAddress()
        setMediumFee()
        setListeners()
        getFees()
        getCourse()
        repeatGetCourse()
        getBalance()
        repeatGetBalance()
        observeGetFees()
        observeCourse()
        observeBalance()
        observeIsSendTransactionOnChain()
        observeIsSendAllFundsTransactionOnChain()
    }

    private fun setExtras() {
        onChainBalance = arguments?.getDouble(Extras.BITCOIN, 0.00)
        convertedOnChainBalance = arguments?.getDouble(Extras.USD, 0.00)
        convertedCurrency = arguments?.getString(Extras.CONVERTED_CURRENCY)
        token = arguments?.getString(Extras.TOKEN)
        idOfUser = arguments?.getString(Extras.USER_ID)
        publicKeyOfServer = arguments?.getString(Extras.PUBLIC_KEY)
        parameterP = arguments?.getString(Extras.PARAMETER_P)
        parameterG = arguments?.getString(Extras.PARAMETER_G)
        idOfWallet = arguments?.getString(Extras.ID_CURRENT_WALLET)
        addressOfWallet = arguments?.getString(Extras.ADDRESS)
        nameOfWallet = arguments?.getString(Extras.NAME_WALLET)
    }

    private fun setAddress() {
        address_of_wallet.text = addressOfWallet?.cutOff()
    }

    private fun setMediumFee() {
        medium_fee.isChecked = true
    }

    private fun setListeners() {
        val listener = View.OnClickListener {
            it.preventDoubleClick()
            when (it.id) {
                R.id.button_max_on_chain -> {
                    setMaxAmount()
                }
                R.id.button_send_on_chain -> {
                    sendOnChainTransaction()
                }
                R.id.scan_qr_for_address -> {
                    scanForBtcAddress()
                }
                R.id.paste_address -> {
                    pasteAddress()
                }
                R.id.slow_fee -> {
                    if (slow_fee.isChecked) {
                        setFee(Fees.MINIMUM.name)
                        enableMediumFee()
                        enableFastFee()
                        disableSlowFee()
                    }
                }
                R.id.medium_fee -> {
                    if (medium_fee.isChecked) {
                        setFee(Fees.MEDIUM.name)
                        enableSlowFee()
                        enableFastFee()
                        disableMediumFee()
                    }
                }
                R.id.fast_fee -> {
                    if (fast_fee.isChecked) {
                        setFee(Fees.MAXIMUM.name)
                        enableSlowFee()
                        enableMediumFee()
                        disableFastFee()
                    }
                }
                R.id.fee_explanation -> {
                    explainFee()
                }
            }
        }
        button_max_on_chain.setOnClickListener(listener)
        button_send_on_chain.setOnClickListener(listener)
        paste_address.setOnClickListener(listener)
        scan_qr_for_address.setOnClickListener(listener)
        slow_fee.setOnClickListener(listener)
        medium_fee.setOnClickListener(listener)
        fast_fee.setOnClickListener(listener)
        fee_explanation.setOnClickListener(listener)
        addListenerForAmount()
        addListenerForConvertedCurrency()
        updateFocuses()
    }

    private fun scanForBtcAddress() {
        val integrator = IntentIntegrator.forSupportFragment(this)
        integrator.apply {
            setDesiredBarcodeFormats(IntentIntegrator.QR_CODE_TYPES)
            setPrompt("Scan")
            setCameraId(0)
            setBeepEnabled(false)
            setBarcodeImageEnabled(false)
            initiateScan()
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        val result = IntentIntegrator.parseActivityResult(requestCode, resultCode, data)
        if(result == null){
            log("QR CONTENTS: $result")
        } else {
            val contents = result.contents
            log("QR CONTENTS: $contents")
            compositeDisposable.add(Observable.fromCallable(ParserQrCallable(contents)).subscribeOn(Schedulers.io())
                    .observeOn(AndroidSchedulers.mainThread()).subscribe { parserHashMap ->
                        handleParserHasMap(parserHashMap)
                    })
        }
        super.onActivityResult(requestCode, resultCode, data)
    }

    private fun handleParserHasMap(parserHashMap: HashMap<String, String>) {
        when(parserHashMap.keys){
            setOf(ParserEnums.ADDRESS.name, ParserEnums.AMOUNT.name) -> {
                edit_of_address.setText(parserHashMap[ParserEnums.ADDRESS.name])
                edit_on_chain_value_send.setText(parserHashMap[ParserEnums.AMOUNT.name])
                setAmountInConvertedCurrency(parserHashMap[ParserEnums.AMOUNT.name]?.toDouble())
            }
            setOf(ParserEnums.ADDRESS.name) -> {
                edit_of_address.setText(parserHashMap[ParserEnums.ADDRESS.name])
            }
            setOf(ParserEnums.CONTENTS.name) -> {
                edit_of_address.setText(parserHashMap[ParserEnums.CONTENTS.name])
            }
        }
    }

    private fun setMaxAmount() {
        edit_on_chain_value_send.requestFocus()
        edit_on_chain_value_send.setText(onChainBalance.toString())
        edit_on_chain_value_send.setSelection(onChainBalance.toString().length)
    }

    private fun explainFee() {
        DialogsUtil(mContext).openAlertDialog(getString(R.string.fees_explanation))
    }

    private fun sendOnChainTransaction() {
        if(validateBitcoin()){
            if(edit_on_chain_value_send.text.toString() == onChainBalance.toString()){
                sendAllFunds()
            } else {
                sendTransaction()
            }
        }
    }

    private fun sendAllFunds() {
        sendViewModel.sendAllFundsLightningOnChain(amount = Utils.convertToSatoshiAmount(edit_on_chain_value_send.text.toString()),
                    feePerByte = fee.toString(),
                    currencyOfWallet = Coins.LIGHTNING,
                    nameCurrentWallet = nameOfWallet,
                    addressReceiver = edit_of_address.text.toString(),
                    token = token,
                    key = Key(idOfUser, publicKeyOfServer, parameterP, parameterG))
    }

    private fun sendTransaction() {
        sendViewModel.sendTransactionLightningOnChain(amount = Utils.convertToSatoshiAmount(edit_on_chain_value_send.text.toString()),
                    feePerByte = fee.toString(),
                    currencyOfWallet = Coins.LIGHTNING,
                    nameCurrentWallet = nameOfWallet,
                    addressReceiver = edit_of_address.text.toString(),
                    token = token,
                    key = Key(idOfUser, publicKeyOfServer, parameterP, parameterG))
    }

    private fun validateBitcoin(): Boolean {
        if(edit_of_address.text.isNullOrBlank() || edit_on_chain_value_send.text.isNullOrBlank() || edit_converted_on_chain_value_send.text.isNullOrBlank()){
            DialogsUtil(mContext).openAlertDialog(getString(R.string.fields_can_not_be_empty))
            return false
        }
        if(!Address.verify(edit_of_address.text.toString(), true)){
            DialogsUtil(mContext)
                    .openAlertDialog(getString(R.string.invalid_payment_address))
            return false
        }
        if(Utils.convertToSatoshi(edit_on_chain_value_send.text.toString()) > Utils.convertToSatoshi(onChainBalance.toString())){
            DialogsUtil(context)
                    .openAlertDialog(getString(R.string.insufficient_funds))
            return false
        }
        return true
    }

    private fun getFees() {
        token?.let { userToken ->
            sendViewModel.getValuesFee(Coins.BITCOIN, userToken, Key(idOfUser, publicKeyOfServer, parameterP, parameterG))
        }
    }

    private fun pasteAddress() {
        val clipboard = mContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager?
        val copiedString = clipboard?.primaryClip?.getItemAt(0)?.text?.toString()
        copiedString?.let{
            edit_of_address.setText(it)
        }
    }

    private fun getCourse() {
        courseViewModel.getCourse(token, Key(idOfUser, publicKeyOfServer, parameterP, parameterG), Coins.BITCOIN, convertedCurrency)
    }

    private fun repeatGetCourse() {
        compositeDisposable.add(Observable.interval(Constants.TEN.toLong(), TimeUnit.MILLISECONDS).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread()).subscribe {
                    getCourse()
                })
    }

    private fun getBalance() {
        balanceViewModel.getBalance(idOfWallet, token, publicKeyOfServer, parameterP, parameterG, idOfUser)
    }

    private fun repeatGetBalance() {
        compositeDisposable.add(Observable.interval(Constants.TEN.toLong(), TimeUnit.MILLISECONDS).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread()).subscribe {
                    getBalance()
                })
    }

    private fun observeGetFees() {
        sendViewModel.getFees().observe(this, Observer {
            feesOfBitcoin = it
            setFee(Fees.MEDIUM.name)
        })
    }

    private fun setFee(key: String) {
        fee = feesOfBitcoin[key]
    }

    private fun observeCourse() {
        courseViewModel.getCurrentCourse().observe(this, Observer {
            course = it
        })
    }

    private fun observeBalance() {
        balanceViewModel.getBalanceOfWallet().observe(this, Observer { balance ->
            listener.updateOnChainBalance(balance.cryptoValue)
        })
    }

    private fun observeIsSendTransactionOnChain() {
        sendViewModel.isSendTransactionOnChain().observe(this, Observer {
            handleIsSendTransaction(it)
        })
    }

    private fun observeIsSendAllFundsTransactionOnChain() {
        sendViewModel.isSendAllFundTransactionOnChain().observe(this, Observer {
            handleIsSendTransaction(it)
        })
    }

    private fun handleIsSendTransaction(isSendTransaction: Boolean) {
        if(isSendTransaction){
            DialogsUtil(mContext).openAlertDialog(getString(R.string.your_transaction_has_been_completed))
        } else {
            DialogsUtil(mContext).openAlertDialog(getString(R.string.btc_transaction_could_not_completed))
        }
    }

    private fun updateFocuses() {
        edit_on_chain_value_send.setOnFocusChangeListener { _, hasFocus -> cryptoFocus = hasFocus }
        edit_converted_on_chain_value_send.setOnFocusChangeListener { _, hasFocus -> convertedCurrencyFocus = hasFocus }
    }

    private fun enableSlowFee() {
        slow_fee.isChecked = false
        slow_fee.isEnabled = true
    }

    private fun enableMediumFee() {
        medium_fee.isChecked = false
        medium_fee.isEnabled = true
    }

    private fun enableFastFee() {
        fast_fee.isChecked = false
        fast_fee.isEnabled = true
    }

    private fun disableSlowFee() {
        slow_fee.isEnabled = false
    }

    private fun disableMediumFee() {
        medium_fee.isEnabled = false
    }

    private fun disableFastFee() {
        fast_fee.isEnabled = false
    }

    private fun addListenerForAmount() {
        compositeDisposable.add(edit_on_chain_value_send.textChanges()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe { amountInBtc ->
                    if(cryptoFocus && amountInBtc.toString().validateToConvert()){
                        val amount = amountInBtc.toString().toDouble()
                        setAmountInConvertedCurrency(amount)
                    }
                })
    }

    private fun setAmountInConvertedCurrency(amount: Double?) {
        course.multiLet(amount){ course, amountBTC ->
            edit_converted_on_chain_value_send.setText((amountBTC * course).round(Round.SECOND.value))
        }
    }

    private fun addListenerForConvertedCurrency() {
        compositeDisposable.add(edit_converted_on_chain_value_send.textChanges()
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe { amountInUsd ->
                    if(convertedCurrencyFocus && amountInUsd.toString().validateToConvert()){
                        val amount = amountInUsd.toString().toDouble()
                        setAmountInCrypto(amount)
                    }
                })
    }

    private fun setAmountInCrypto(amount: Double) {
        course?.let {
            edit_on_chain_value_send.setText((amount / it).round(Round.EIGHT.value))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        compositeDisposable.clear()
    }

}