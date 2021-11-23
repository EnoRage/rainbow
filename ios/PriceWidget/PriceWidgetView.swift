//
//  PriceWidgetView.swift
//  Rainbow
//
//  Created by Ben Goldberg on 10/27/21.
//

import Foundation
import SwiftUI
import UIKit

@available(iOS 14.0, *)
struct PriceWidgetView: View {

  let tokenData: TokenData
  let date: Date
  
  private func toString(double: Double) -> String {
    return String(format: "%f", double)
  }
  
  private func getIcon(icon: UIImage) -> UIImage {
    return tokenData.icon!.resizeImageTo(size: CGSize(width: 20, height: 20))
  }
  
  private func formatPercent(double: Double) -> String {
    let nf = NumberFormatter()
    nf.usesGroupingSeparator = true
    nf.minimumFractionDigits = 2
    return nf.string(for: abs(tokenData.priceChange!))! + "%"
  }
  
  private func convertToCurrency(double: Double, currency: Currency?) -> String {
    let nf = NumberFormatter()
    nf.usesGroupingSeparator = true
    nf.numberStyle = .currency
    switch currency {
    case .eth:
      nf.currencySymbol = "Ξ"
    case .usd:
      nf.currencySymbol = "$"
    case .eur:
      nf.currencySymbol = "€"
    case .gbp:
      nf.currencySymbol = "£"
    case .aud:
      nf.currencySymbol = "A$"
    case .cny:
      nf.currencySymbol = "¥"
    case .krw:
      nf.currencySymbol = "₩"
      nf.maximumFractionDigits = 0
    case .rub:
      nf.currencySymbol = "₽"
    case .inr:
      nf.currencySymbol = "₹"
    case .jpy:
      nf.currencySymbol = "¥"
      nf.maximumFractionDigits = 0
    case .try:
      nf.currencySymbol = "₺"
    case .cad:
      nf.currencySymbol = "CA$"
    case .nzd:
      nf.currencySymbol = "NZ$"
    case .zar:
      nf.currencySymbol = "R"
    default:
      nf.currencySymbol = "$"
    }
    if (double < 1.0) {
      nf.maximumSignificantDigits = 2
    }
    return nf.string(for: double)!
  }
  
  private func getColor(tokenData: TokenData) -> SwiftUI.Color {
    if (tokenData.tokenDetails != nil) {
      if let color = tokenData.tokenDetails!.color {
        return hexStringToColor(hex: color)
      } else if let palette = tokenData.icon?.getColors() {
        return SwiftUI.Color(palette.primary)
      }
    }
    return Color(red:0.15, green:0.16, blue:0.18)
  }
  
  private func hexStringToColor(hex: String) -> SwiftUI.Color {
      var cString:String = hex.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()

      if (cString.hasPrefix("#")) {
          cString.remove(at: cString.startIndex)
      }

      if ((cString.count) != 6) {
          return Color(UIColor.gray)
      }

      var rgbValue:UInt64 = 0
      Scanner(string: cString).scanHexInt64(&rgbValue)

      return Color(UIColor(
          red: CGFloat((rgbValue & 0xFF0000) >> 16) / 255.0,
          green: CGFloat((rgbValue & 0x00FF00) >> 8) / 255.0,
          blue: CGFloat(rgbValue & 0x0000FF) / 255.0,
          alpha: CGFloat(1.0))
      )
  }
  
  var body: some View {
    let bgColor = getColor(tokenData: tokenData)
    let gray = hexStringToColor(hex: "#25292E")
    let whiteContrast = UIColor(bgColor).contrastRatio(with: .white)
    let grayContrast = UIColor(bgColor).contrastRatio(with: UIColor(gray))
    let fgColor = tokenData.tokenDetails != nil && tokenData.tokenDetails!.color == nil && grayContrast > 2 * whiteContrast ? gray : Color.white
    
    GeometryReader { geometry in
      ZStack {
          Rectangle()
            .fill(bgColor)
            .offset(x: 0, y: 0)
        
          Rectangle()
            .fill(
              RadialGradient(gradient: Gradient(colors: [.black.opacity(0), .black]), center: .topLeading, startRadius: 0, endRadius: geometry.size.width * sqrt(2))
            )
            .opacity(0.08)

          Rectangle()
            .fill(
              RadialGradient(gradient: Gradient(colors: [.white.opacity(0), .black]), center: .bottomLeading, startRadius: 0, endRadius: geometry.size.width * sqrt(2) * 0.8323)
            )
            .blendMode(.overlay)
            .opacity(0.12)
        if (tokenData.tokenDetails != nil && tokenData.price != nil && tokenData.priceChange != nil) {
          VStack(alignment: .leading) {
            HStack {
              Text(tokenData.tokenDetails!.symbol!)
                .font(.custom("SF Pro Rounded", size: 18))
                .fontWeight(.heavy)
                .foregroundColor(fgColor)
                .tracking(0.4)
                .frame(height: 20)
                .mask(
                  LinearGradient(gradient: Gradient(colors: [fgColor.opacity(0.9), fgColor.opacity(0.8)]), startPoint: .leading, endPoint: .trailing)
                )

              Spacer()

              if (tokenData.icon != nil) {
                Image(uiImage: tokenData.icon!.resizeImageTo(size: CGSize(width: 20, height: 20)))
                  .frame(width: 20, height: 20)
                  .clipShape(Circle())
              }
            }
            Spacer()
            
            HStack {
              VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 3) {
                  if (tokenData.priceChange! >= 0) {
                    Image(systemName: "arrow.up")
                      .font(.system(size: 18, weight: .heavy, design: .rounded))
                      .foregroundColor(fgColor)
                  } else {
                    Image(systemName: "arrow.down")
                      .font(.system(size: 18, weight: .heavy, design: .rounded))
                      .foregroundColor(fgColor)
                  }
                  Text(formatPercent(double: tokenData.priceChange!))
                    .font(.custom("SF Pro Rounded", size: 18))
                    .fontWeight(.heavy)
                    .foregroundColor(fgColor)
                    .tracking(0.2)
                }.mask(
                  LinearGradient(gradient: Gradient(colors: [fgColor.opacity(0.9), fgColor.opacity(0.8)]), startPoint: .leading, endPoint: .trailing)
                )
                Text(convertToCurrency(double: tokenData.price!, currency: tokenData.currency))
                    .font(.custom("SF Pro Rounded", size: 28))
                    .fontWeight(.heavy)
                    .foregroundColor(fgColor)
                    .minimumScaleFactor(0.01)
                    .lineLimit(1)
                    .frame(height: 33, alignment: .top)
              }
            }
            
            Spacer()
            
            if (tokenData.priceChange == 9.99 && tokenData.price == 9999.99) {
              Text("This is fake data")
                .font(.custom("SF Pro Rounded", size: 10))
                .fontWeight(.bold)
                .foregroundColor(fgColor.opacity(0.4))
                .tracking(0.2)
            } else {
              (Text("Updated at ") + Text(date, style: .time))
                .font(.custom("SF Pro Rounded", size: 10))
                .fontWeight(.bold)
                .foregroundColor(fgColor.opacity(0.5))
                .tracking(0.2)
            }
          }.padding(16)
        } else {
          VStack(alignment: .leading) {
            Text("Couldn't retrieve token data \u{1F9D0}")
              .font(.custom("SF Pro Rounded", size: 28))
              .fontWeight(.heavy)
              .foregroundColor(.white)
              .minimumScaleFactor(0.01)
              .lineLimit(2)
              .multilineTextAlignment(.center)
          }.padding(16)
        }
      }
    }
  }
}
