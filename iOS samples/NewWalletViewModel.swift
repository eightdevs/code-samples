//
//  NewWalletViewModel.swift
//  BitFreezer
//
//  Created by Oleksii Shulzhenko on 06.06.2018.
//  Copyright © 2018 altRecipe. All rights reserved.
//

import Foundation
import RxSwift

class NewWalletViewModel {
    
    private let disposeBag = DisposeBag()
    
    let nameText = Variable<String>("")
    let currency = Variable<Address.Сurrency>(.BTC)
    
    var encryptIsOn  = false
    let encryptionKey = Variable<String?>(nil)
    
    let encryptionKeyText = Variable<String?>(nil)
    let repeatedEncryptionKeyText = Variable<String?>(nil)
    
    let didSelectCreateButton = PublishSubject<Void>()
    let didSelectBackButton = PublishSubject<Void>()
    
    let oldFileEncryptionKey: String?
    
    let addressIsCreated = PublishSubject<Void>()
    
    var address: Address? = nil
    var addreses: [Address]? = nil
    
    let didSelectWalletEncryptiomInfoButton = PublishSubject<Void>()
    
    let presentAllertWithMessage = PublishSubject<String>()
    
    let subscriptionText: String
    
    let switchToUpgrade = PublishSubject<Void>()
    
    init(addreses: [Address], oldFileEncryptionKey: String?, subscriptionText: String) {
        
        self.oldFileEncryptionKey = oldFileEncryptionKey
        self.subscriptionText = subscriptionText
        
        didSelectCreateButton
            .flatMap({ [unowned self](_) -> Observable<Void> in
                if self.nameText.value.count <= 0 || (self.encryptIsOn && ((self.encryptionKeyText.value == nil || self.encryptionKeyText.value == "") || (self.repeatedEncryptionKeyText.value == nil || self.repeatedEncryptionKeyText.value == ""))) {
                    
                    return Observable.error(NewWalletViewModelError.allFieldsNotFeelled)
                } else if self.encryptIsOn && self.encryptionKeyText.value != self.repeatedEncryptionKeyText.value {
                    
                    return Observable.error(NewWalletViewModelError.passwordsNotMatched)
                } else {
                    
                    self.encryptionKey.value = self.encryptionKeyText.value
                    return Observable.just(Void())
                }
            })
            .flatMap { [unowned self](_) -> Observable<Address> in
                return DataManager.shared.createWallet(currency: self.currency.value)
            }
            .do(onError: { [unowned self](error) in
                if let error = error as? NewWalletViewModelError {
                    self.presentAllertWithMessage.onNext(error.localizedDescription)
                }})
            .retry()
            .subscribe(onNext: { [unowned self](newAddress) in
                self.address = newAddress
                self.addreses = addreses
                self.addressIsCreated.onNext(())
            }).disposed(by: disposeBag)
        
        didSelectWalletEncryptiomInfoButton.do(onNext: { [unowned self]() in
            self.presentAllertWithMessage.onNext(NewWalletViewModelAllertMessages.walletPasswordInfo.rawValue)
        }).subscribe().disposed(by: disposeBag)
    }
}

enum NewWalletViewModelAllertMessages: String {
    case walletPasswordInfo = "Highly recommended. This is an additional password for this particular wallet you are creating. In order to send crypto from this wallet you will have to enter an additional password."
}

public enum NewWalletViewModelError: Error {
    case allFieldsNotFeelled
    case passwordsNotMatched
}

extension NewWalletViewModelError: LocalizedError {
    public var errorDescription: String? {
        switch self {
        case .allFieldsNotFeelled:
            return NSLocalizedString("Please fill in all the required fields.", comment: "My error")
        case .passwordsNotMatched:
            return NSLocalizedString("Passwords do not match.", comment: "My error")
        }
    }
}
