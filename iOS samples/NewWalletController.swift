//
//  NewWalletController.swift
//  BitFreezer
//
//  Created by Oleksii Shulzhenko on 06.06.2018.
//  Copyright © 2018 altRecipe. All rights reserved.
//

import UIKit
import RxSwift
import RxGesture

class NewWalletController: UIViewController {
    
    var viewModel: NewWalletViewModel!
    
    private let disposeBag = DisposeBag()
    
    @IBOutlet weak var nameTextField: UITextField!
    @IBOutlet weak var currencyLable: UILabel!
    @IBOutlet weak var encryptSwitch: UISwitch!
    @IBOutlet weak var encryptionKeyTextField: UITextField!
    @IBOutlet weak var repeatedEncryptionKeyTextField: UITextField!
    
    @IBOutlet weak var enterPasswordView: UIView!
    @IBOutlet weak var reenterPasswordView: UIView!
    
    @IBOutlet weak var newWalletButton: UIButton!
    @IBOutlet weak var currencyPickerView: UIPickerView!
    @IBOutlet weak var backgroundView: UIView!
    
    @IBOutlet weak var walletEncryptiomInfoButton: UIButton!
    
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        bind()
        configureNavigationBar()
        createGradientLayer()
        configureKeyboard()
        configureCurrencyPickerView()
    }
    
    override func viewDidLayoutSubviews() {
        configureNewWalletButton()
        currencyPickerView.frame.origin.y = self.backgroundView.frame.height
    }
    
    override func preferredScreenEdgesDeferringSystemGestures() -> UIRectEdge {
        return [.bottom]
    }
    
    //MARK: - Methods
    
    private func bind() {
        
        currencyLable.text = Address.Сurrency.BTC.rawValue
        
        nameTextField.rx.text
            .orEmpty
            .bind(to: viewModel.nameText)
            .disposed(by: disposeBag)
        
        encryptionKeyTextField.rx.text
            .orEmpty
            .bind(to: viewModel.encryptionKeyText)
            .disposed(by: disposeBag)
        
        repeatedEncryptionKeyTextField.rx.text
            .orEmpty
            .bind(to: viewModel.repeatedEncryptionKeyText)
            .disposed(by: disposeBag)
        
        encryptSwitch.rx.isOn
            .subscribe(onNext: { [unowned self](isOn) in
                if isOn {
                    
                    self.viewModel.encryptionKeyText.value = self.encryptionKeyTextField.text
                    self.viewModel.repeatedEncryptionKeyText.value = self.repeatedEncryptionKeyTextField.text
                    
                } else if !isOn {
                    
                    self.viewModel.encryptionKeyText.value = nil
                    self.viewModel.repeatedEncryptionKeyText.value = nil
                }
            })
        .disposed(by: disposeBag)
        
        newWalletButton.rx.tap.bind(to: viewModel.didSelectCreateButton)
            .disposed(by: disposeBag)
        
        encryptSwitch.rx.isOn
            .subscribe(onNext: { [unowned self](isOn) in
                if isOn {
                    UIView.transition(with: self.enterPasswordView, duration: 0.3, options: .transitionCrossDissolve, animations: {
                        self.enterPasswordView.isHidden = false
                    })
                    UIView.transition(with: self.reenterPasswordView, duration: 0.3, options: .transitionCrossDissolve, animations: {
                        self.reenterPasswordView.isHidden = false
                    })
                    
                    self.viewModel.encryptIsOn = true
                } else {
                    
                    UIView.transition(with: self.enterPasswordView, duration: 0.3, options: .transitionCrossDissolve, animations: {
                        self.enterPasswordView.isHidden = true
                    })
                    UIView.transition(with: self.reenterPasswordView, duration: 0.3, options: .transitionCrossDissolve, animations: {
                        self.reenterPasswordView.isHidden = true
                    })
                    
                    self.viewModel.encryptIsOn = false
                }
            }).disposed(by: disposeBag)
            
        Observable.just(Address.Сurrency.allCases)
            .observeOn(MainScheduler.asyncInstance)
            .bind(to: currencyPickerView.rx.itemTitles) { [unowned self]_, item in
                if self.viewModel.subscriptionText != "trial" {
                    switch item {
                    case .ETH:
                        return "ETH & ERC20 Tokens"
                    default:
                        return item.rawValue
                    }
                } else {
                    switch item {
                    case .BTC:
                        return item.rawValue
                    case .ETH:
                        return "ETH & ERC20 Tokens (premium only)"
                    default:
                        return item.rawValue + " (premium only)"
                    }
                }
            }
            .disposed(by: disposeBag)
        
        currencyPickerView.rx.modelSelected(Address.Сurrency.self)
            .subscribe(onNext: { [unowned self]models in
                
                if self.viewModel.subscriptionText == "trial" && models[0] != .BTC  {
                    
                    let alertController = UIAlertController(title: "", message: "Please upgrade your plan to access this feature.", preferredStyle: .alert)
                    let upgradeAction = UIAlertAction(title: "Upgrade", style: .default, handler: { [unowned self](action) in
                        self.viewModel.switchToUpgrade.onNext(())
                    })
                    let cancelAction = UIAlertAction(title: "Cancel", style: .default, handler: nil)
                    alertController.addAction(cancelAction)
                    alertController.addAction(upgradeAction)
                    self.present(alertController, animated: true, completion: nil)
                    
                } else {
                
                    self.viewModel.currency.value = models[0]
                    
                    var currencyLableText = ""
                    
                    switch models[0] {
                    case .ETH:
                        currencyLableText = "ETH & ERC20 Tokens"
                    default:
                        currencyLableText = models[0].rawValue
                    }
                    
                    self.currencyLable.text = currencyLableText
                    UIView.animate(withDuration: 0.5, delay: 0, options: .curveEaseInOut, animations: { [unowned self] in
                        self.currencyPickerView.frame.origin.y = self.currencyPickerView.superview!.frame.height
                        }, completion: nil)
                    
                }
            })
            .disposed(by: disposeBag)
        
        currencyPickerView.rx
            .tapGesture()
            .when(.recognized)
            .subscribe(onNext: { [unowned self](_) in
                
                    var selectedRow = self.currencyPickerView.selectedRow(inComponent: 0)
                    if selectedRow < 0 {
                        selectedRow = 0
                    } else if selectedRow > Address.Сurrency.allCases.count - 1 {
                        selectedRow = Address.Сurrency.allCases.count - 1
                    }
                    let model = Address.Сurrency.allCases[selectedRow]
                    
                    
                if false {
                        
                        let alertController = UIAlertController(title: "", message: "Please upgrade your plan to access this feature.", preferredStyle: .alert)
                        let upgradeAction = UIAlertAction(title: "Upgrade", style: .default, handler: { [unowned self](action) in
                            self.viewModel.switchToUpgrade.onNext(())
                        })
                        let cancelAction = UIAlertAction(title: "Cancel", style: .default, handler: nil)
                        alertController.addAction(cancelAction)
                        alertController.addAction(upgradeAction)
                        self.present(alertController, animated: true, completion: nil)
                        
                    } else {
                        
                        self.viewModel.currency.value = model
                        
                        var currencyLableText = ""
                        
                        switch model {
                        case .ETH:
                            currencyLableText = "ETH & ERC20 Tokens"
                        default:
                            currencyLableText = model.rawValue
                        }
                        
                        self.currencyLable.text = currencyLableText
                        UIView.animate(withDuration: 0.5, delay: 0, options: .curveEaseInOut, animations: { [unowned self] in
                            self.currencyPickerView.frame.origin.y = self.currencyPickerView.superview!.frame.height
                            }, completion: nil)
                    }
            })
            .disposed(by: disposeBag)
        
        self.viewModel.currency.asObservable().subscribe(onNext: { [unowned self](currency) in
            if currency == .Lightning {
                self.encryptSwitch.isEnabled = true
            }
        }).disposed(by: disposeBag)
        
        currencyLable.rx
            .tapGesture()
            .when(.recognized)
            .subscribe(onNext: { _ in
                UIView.animate(withDuration: 0.5, delay: 0, options: .curveEaseInOut, animations: { [unowned self] in
                    if self.currencyPickerView.frame.origin.y >= self.currencyPickerView.superview!.frame.height {
                        self.currencyPickerView.frame.origin.y = self.currencyPickerView.superview!.frame.height - self.currencyPickerView.frame.size.height - 8
                    } else {
                        self.currencyPickerView.frame.origin.y = self.currencyPickerView.superview!.frame.height
                    }
                    }, completion: nil)
            })
            .disposed(by: disposeBag)
        
        walletEncryptiomInfoButton.rx.tap.bind(to: viewModel.didSelectWalletEncryptiomInfoButton).disposed(by: disposeBag)
        
        viewModel.presentAllertWithMessage
            .subscribe(onNext: { [unowned self](errorMessage) in
                self.alert(message: errorMessage)
            }).disposed(by: disposeBag)
    }
    
    private func configureNavigationBar() {
        self.navigationController?.navigationBar.setBackgroundImage(UIImage(), for: UIBarMetrics.default)
        self.navigationController?.navigationBar.shadowImage = UIImage()
        self.navigationController?.navigationBar.isTranslucent = true
        self.navigationController?.view.backgroundColor = UIColor.clear
        
        let backButton = UIBarButtonItem()
        backButton.image = #imageLiteral(resourceName: "1arrow 2x")
        backButton.tintColor = UIColor.white
        backButton.rx.tap.bind(to: viewModel.didSelectBackButton).disposed(by: disposeBag)
        navigationItem.leftBarButtonItem = backButton
    }
    
    private func createGradientLayer() {
        let gradientLayer = CAGradientLayer()
        gradientLayer.frame = self.view.bounds
        gradientLayer.colors = [
            UIColor(red: 0.67, green: 0.57, blue: 0.9, alpha: 1).cgColor,
            UIColor(red: 0.34, green: 0.8, blue: 0.95, alpha: 1).cgColor
        ]
        gradientLayer.startPoint = CGPoint(x: 0.0, y: 0.75)
        gradientLayer.endPoint = CGPoint(x: 1.0, y: 0.25)
        self.backgroundView.layer.addSublayer(gradientLayer)
    }
    
    private func configureKeyboard() {
        let tapGesture = UITapGestureRecognizer()
        view.addGestureRecognizer(tapGesture)
        tapGesture.rx.event.bind(onNext: { [unowned self]recognizer in
            self.view.endEditing(true)
        }).disposed(by: disposeBag)
    }
    
    func configureNewWalletButton() {
        let gradientLayer = CAGradientLayer()
        gradientLayer.frame = self.newWalletButton.bounds
        gradientLayer.colors = [
            UIColor(red: 0.67, green: 0.57, blue: 0.9, alpha: 1).cgColor,
            UIColor(red: 0.34, green: 0.8, blue: 0.95, alpha: 1).cgColor
        ]
        gradientLayer.startPoint = CGPoint(x: 0.0, y: 0.75)
        gradientLayer.endPoint = CGPoint(x: 1.0, y: 0.25)
        gradientLayer.masksToBounds = true
        
        let shadowLayer = CALayer.init()
        shadowLayer.frame = newWalletButton.frame
        shadowLayer.shadowColor = UIColor(red: 0.77, green: 0.57, blue: 0.9, alpha: 0.5).cgColor
        shadowLayer.shadowOpacity = 1
        shadowLayer.shadowRadius = 15
        shadowLayer.shadowOffset = CGSize(width: 0, height: 10)
        shadowLayer.shadowPath = CGPath.init(rect: shadowLayer.bounds, transform: nil)
        
        newWalletButton.superview!.layer.insertSublayer(shadowLayer, below: newWalletButton.layer)
        
        newWalletButton.layer.insertSublayer(gradientLayer, at: 0)
        newWalletButton.layer.cornerRadius = 20.0
        newWalletButton.clipsToBounds = true
    }
    
    private func configureCurrencyPickerView() {
        currencyPickerView.backgroundColor = .white
        currencyPickerView.borderColor = .lightGray
    }
}
