//
//  NewWalletCoordinator.swift
//  BitFreezer
//
//  Created by Oleksii Shulzhenko on 06.06.2018.
//  Copyright © 2018 altRecipe. All rights reserved.
//

import UIKit
import RxSwift

class NewWalletCoordinator: Coordinator {
    
    private let presenter: UINavigationController
    private let addreses: [Address]
    private let oldFileEncryptionKey: String?
    private let subscriptionText: String
    private var newWalletViewController: NewWalletController?
    private var newWallet1Coordinator: NewWallet1Coordinator?
    let finished = PublishSubject<Void>()
    private let disposeBag = DisposeBag()
    
    private let email: String
    
    let addresesInFile: [AddressInFile]
    
    init(presenter: UINavigationController, addreses: [Address], oldFileEncryptionKey: String?, email: String, subscriptionText: String, addresesInFile: [AddressInFile]) {
        self.presenter = presenter
        self.addreses = addreses
        self.oldFileEncryptionKey = oldFileEncryptionKey
        self.email = email
        self.subscriptionText = subscriptionText
        self.addresesInFile = addresesInFile
    }
    
    func start() {
        let newWalletViewController = UIStoryboard(name: "Main", bundle: nil).instantiateViewController(withIdentifier: String(describing: NewWalletController.self)) as! NewWalletController
        
        let viewModel = NewWalletViewModel(addreses: addreses, oldFileEncryptionKey: oldFileEncryptionKey, subscriptionText: subscriptionText)
        newWalletViewController.viewModel = viewModel
        
        viewModel.didSelectBackButton.subscribe(onNext: { [unowned self]() in
            self.finish()
        }).disposed(by: disposeBag)
        
        viewModel.addressIsCreated.subscribe(onNext: { [unowned self]() in
            if let newAddress = viewModel.address, let addreses = viewModel.addreses {
                
                self.presentNewWallet1(newAddress: newAddress, name: viewModel.nameText.value, encryptionKey: viewModel.encryptionKey.value, oldFileEncryptionKey: viewModel.oldFileEncryptionKey, addreses: addreses)
            }
        }).disposed(by: disposeBag)
        
        viewModel.switchToUpgrade.subscribe { [unowned self](_) in
            self.switchToUpgrade()
        }.disposed(by: disposeBag)
        
        presenter.pushViewController(newWalletViewController, animated: true)
        self.newWalletViewController = newWalletViewController
    }
    
    func finish() {
        self.presenter.popViewController(animated: true)
        self.finished.onNext(())
    }
    
    private func presentNewWallet1(newAddress: Address, name: String, encryptionKey: String?, oldFileEncryptionKey: String?, addreses: [Address]) {
        newWallet1Coordinator = NewWallet1Coordinator(presenter: presenter, newAddress: newAddress, name: name, encryptionKey: encryptionKey, oldFileEncryptionKey: oldFileEncryptionKey, addreses: addreses, email: email)
        newWallet1Coordinator?.start()
        newWallet1Coordinator?.finished.subscribe({ [unowned self](_) in
            self.newWallet1Coordinator = nil
        }).disposed(by: disposeBag)
    }
    
    private func switchToUpgrade() {
        var upgradeCoordinator: UpgradeCoordinator? = UpgradeCoordinator(presenter: presenter, email: email, addresesInFile: addresesInFile, oldFileEncryptionKey: oldFileEncryptionKey)
        let viewControllers: [UIViewController] = presenter.viewControllers as [UIViewController]
        presenter.popToViewController(viewControllers[viewControllers.count - 3], animated: false)
        upgradeCoordinator?.start()
        upgradeCoordinator?.finished.subscribe({ (_) in
            upgradeCoordinator = nil
        }).disposed(by: disposeBag)
    }
}
