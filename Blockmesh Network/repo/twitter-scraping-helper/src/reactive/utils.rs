use anyhow::anyhow;
use scraper::{Html, Selector};

pub fn text_to_num(text: String) -> Option<u32> {
    if text.is_empty() {
        return Some(0);
    }
    
    let text = text.replace(',', "");
    let result = if text.contains('K') {
        let num: f64 = text.replace('K', "").parse().unwrap_or(0.0);
        (num * 1000.0) as u32
    } else {
        text.parse().unwrap_or(0)
    };
    Some(result)
}

pub fn get_number_by_selector(fragment: &Html, selector_str: &str) -> anyhow::Result<String> {
    let selector = Selector::parse(selector_str).map_err(|e| anyhow!(e.to_string()))?;
    let mut result = String::new();
    for element in fragment.select(&selector) {
        let text = element.text().collect::<Vec<_>>().join("");
        if !text.is_empty() {
            result = text;
            break;
        }
    }
    Ok(result)
}

pub fn get_text_by_selector(fragment: &Html, selector_str: &str) -> anyhow::Result<String> {
    let selector = Selector::parse(selector_str).map_err(|e| anyhow!(e.to_string()))?;
    let mut result = String::new();
    for element in fragment.select(&selector) {
        result.push_str(&element.text().collect::<Vec<_>>().join(""));
    }
    Ok(result)
}
