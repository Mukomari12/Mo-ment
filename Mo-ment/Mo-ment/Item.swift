//
//  Item.swift
//  Mo-ment
//
//  Created by Muqtader Omari on 4/23/25.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date
    
    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
