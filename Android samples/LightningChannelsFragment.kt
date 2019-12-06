package bitfreezer.app.wallet.fragments.channels_fragments

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.Observer
import androidx.recyclerview.widget.ItemTouchHelper
import bitfreezer.app.wallet.R
import bitfreezer.app.wallet.adapters.ChannelAdapter
import bitfreezer.app.wallet.custom_views.ChannelItemTouchHelper
import bitfreezer.app.wallet.custom_views.RecyclerViewParameters
import bitfreezer.app.wallet.dialogs.DialogCloseChannels
import bitfreezer.app.wallet.dialogs.DialogDeleteChannel
import bitfreezer.app.wallet.enums.Coins
import bitfreezer.app.wallet.enums.Constants
import bitfreezer.app.wallet.enums.Extras
import bitfreezer.app.wallet.extensions.*
import bitfreezer.app.wallet.interfaces.ChannelItemTouchListener
import bitfreezer.app.wallet.interfaces.CloseChannelsListener
import bitfreezer.app.wallet.interfaces.DeleteChannelListener
import bitfreezer.app.wallet.pojo.Key
import bitfreezer.app.wallet.pojo.TotalChannelBalance
import bitfreezer.app.wallet.utils.DialogsUtil
import bitfreezer.app.wallet.view_models.ChannelsViewModel
import bitfreezer.app.wallet.view_models.LightningChannelsViewModel
import io.reactivex.Observable
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.CompositeDisposable
import io.reactivex.schedulers.Schedulers
import kotlinx.android.synthetic.main.lightning_my_channels.*
import org.koin.androidx.viewmodel.ext.android.viewModel
import java.util.concurrent.TimeUnit

class LightningChannelsFragment : Fragment(), CloseChannelsListener, DeleteChannelListener, ChannelItemTouchListener {

    private var idCurrentWallet: String? = null
    private var token: String? = null
    private var idUser: String? = null

    private var publicKeyServer: String? = null
    private var parameterP: String? = null
    private var parameterG: String? = null

    private lateinit var mContext: Context

    private val channelsViewModel: ChannelsViewModel by viewModel()
    private val lightningChannelsViewModel: LightningChannelsViewModel by viewModel()
    private val compositeDisposable = CompositeDisposable()
    private lateinit var adapter: ChannelAdapter
    private var itemTouchHelper: ItemTouchHelper? = null

    private lateinit var closeChannelsListener: CloseChannelsListener

    fun setListener(closeChannelsListener: CloseChannelsListener){
        this.closeChannelsListener = closeChannelsListener
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        mContext = context
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? = inflater.inflate(R.layout.lightning_my_channels, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        initAdapter()
        setItemTouchHelper()
        setListeners()
        setExtras()
        getAllChannels()
        repeatGetAllChannels()
        observeTotalChannelBalance()
        observeOpenedChannels()
    }

    private fun initAdapter() {
        adapter = ChannelAdapter()
        RecyclerViewParameters.setParameters(recycler_view_channels, mContext)
        recycler_view_channels.adapter = adapter
    }

    private fun setItemTouchHelper() {
        val itemTouchCallBack = ChannelItemTouchHelper(0, ItemTouchHelper.LEFT)
        itemTouchCallBack.setListener(this)
        itemTouchHelper = ItemTouchHelper(itemTouchCallBack)
        itemTouchHelper?.attachToRecyclerView(recycler_view_channels)
    }

    override fun onSwiped(position: Int) {
        openDialogDeleteChannel(position)
    }

    private fun openDialogDeleteChannel(position: Int) {
        val dialogDeleteChannel = DialogDeleteChannel()
        val bundle = Bundle()
        bundle.putInt("position", position)
        dialogDeleteChannel.arguments = bundle
        dialogDeleteChannel.setListener(this)
        fragmentManager?.let{
            dialogDeleteChannel.show(it, "dialogDeleteChannel")
        }
    }

    override fun deleteChannel(position: Int) {
        val openChannel = adapter.getOpenChannel(position)
        token?.let {
            lightningChannelsViewModel.closeChosenChannel(openChannel.idOfChannel, it, Key(idUser, publicKeyServer, parameterP, parameterG))
        }
        lightningChannelsViewModel.isClosedChosenChannel().observe(this, Observer { isClosed ->
            if(isClosed){
                adapter.removeOpenChannel(openChannel)
                if(adapter.isEmpty()){
                    closeChannelsListener.closeAllChannels()
                }
            }
        })
    }

    override fun cancelDeleteChannel(position: Int) {
        adapter.notifyItemChanged(position)
    }

    private fun setListeners() {
        val listener = View.OnClickListener {
            it.preventDoubleClick()
            when (it.id) {
                R.id.close_all_channels -> {
                    openDialogCloseChannels()
                }
            }
        }
        close_all_channels.setOnClickListener(listener)
    }

    private fun setExtras() {
        idCurrentWallet = arguments?.getString(Extras.ID_CURRENT_WALLET)
        token = arguments?.getString(Extras.TOKEN)
        idUser = arguments?.getString(Extras.USER_ID)
        publicKeyServer = arguments?.getString(Extras.PUBLIC_KEY)
        parameterP = arguments?.getString(Extras.PARAMETER_P)
        parameterG = arguments?.getString(Extras.PARAMETER_G)
    }

    private fun getAllChannels() {
        channelsViewModel.getLightningChannels(idCurrentWallet, token, Key(idUser, publicKeyServer, parameterP, parameterG))
    }

    private fun observeOpenedChannels() {
        channelsViewModel.getChannelsOfLightning().observe(this, Observer {
            adapter.updateChannels(it)
        })
    }

    private fun observeTotalChannelBalance() {
        channelsViewModel.getTotalChannelBalance().observe(this, Observer {
            handleTotalChannelBalance(it)
        })
    }

    private fun repeatGetAllChannels() {
        compositeDisposable.add(Observable.interval(Constants.LONG.toLong(), TimeUnit.MILLISECONDS).subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread()).subscribe {
                    getAllChannels()
                })
    }

    private fun handleTotalChannelBalance(totalChannelBalance: TotalChannelBalance) {
        total_balance_of_channels_in_btc.text = totalChannelBalance.localChannelsAmount.prepareBalance(Coins.BITCOIN)
        total_balance_of_channels_in_usd.text = totalChannelBalance.convertedLocalChannelAmount.prepareConvertedCurrencyBalance(totalChannelBalance.convertedCurrency)
    }

    private fun openDialogCloseChannels() {
        val dialogCloseChannels = DialogCloseChannels()
        dialogCloseChannels.setListener(this)
        fragmentManager?.let {
            dialogCloseChannels.show(it, "dialogCloseChannels")
        }
    }

    override fun closeAllChannels() {
        token?.let {
            lightningChannelsViewModel.closeChannels(it, Key(idUser, publicKeyServer, parameterP, parameterG))
        }
        lightningChannelsViewModel.isCloseAllChannels().observe(this, Observer { isClose ->
            handleIsCloseAllChannels(isClose)
        })
    }

    private fun handleIsCloseAllChannels(isCloseAllChannels: Boolean) {
        if(isCloseAllChannels){
            closeChannelsListener.closeAllChannels()
            DialogsUtil(mContext).openAlertDialog(getString(R.string.channels_is_closed))
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        compositeDisposable.clear()
    }

}