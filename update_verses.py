import re
import os

# Mapping of book numbers to their verses (extracted from the files)
verses = {
    36: '"I will take you out of the nations... and sprinkle clean water on you, and you will be clean." — Zephaniah 3:17',
    37: '"The Lord Almighty says: Give careful thought to your ways." — Haggai 1:7',
    38: '"Not by might nor by power, but by My Spirit, says the Lord Almighty." — Zechariah 4:6',
    39: '"I the Lord do not change." — Malachi 3:6',
    40: '"You shall call His name Jesus, for He will save His people from their sins." — Matthew 1:21',
    41: '"The Son of Man did not come to be served, but to serve, and to give His life as a ransom for many." — Mark 10:45',
    42: '"For the Son of Man came to seek and to save the lost." — Luke 19:10',
    43: '"In the beginning was the Word, and the Word was with God, and the Word was God." — John 1:1',
    44: '"But you will receive power when the Holy Spirit comes on you; and you will be my witnesses." — Acts 1:8',
    45: '"For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes." — Romans 1:16',
    46: '"God chose the foolish things of the world to shame the wise." — 1 Corinthians 1:27',
    47: '"My grace is sufficient for you, for My power is made perfect in weakness." — 2 Corinthians 12:9',
    48: '"It is for freedom that Christ has set us free." — Galatians 5:1',
    49: '"For by grace you have been saved through faith—and this is not from yourselves, it is the gift of God." — Ephesians 2:8',
    50: '"I can do all things through Christ who strengthens me." — Philippians 4:13',
    51: '"He is before all things, and in Him all things hold together." — Colossians 1:17',
    52: '"For God did not appoint us to suffer wrath but to receive salvation through our Lord Jesus Christ." — 1 Thessalonians 5:9',
    53: '"The Lord is faithful; He will strengthen you and protect you from the evil one." — 2 Thessalonians 3:3',
    54: '"Christ Jesus came into the world to save sinners—of whom I am the worst." — 1 Timothy 1:15',
    55: '"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness." — 2 Timothy 3:16',
    56: '"The grace of God... teaches us to say 'No' to ungodliness." — Titus 2:11–12',
    57: '"Perhaps the reason he was separated from you for a little while was that you might have him back forever." — Philemon 1:15',
    58: '"Jesus Christ is the same yesterday and today and forever." — Hebrews 13:8',
    59: '"Faith without deeds is dead." — James 2:26',
    60: '"But you are a chosen people, a royal priesthood, a holy nation, God's special possession." — 1 Peter 2:9',
    61: '"His divine power has given us everything we need for a godly life." — 2 Peter 1:3',
    62: '"If we confess our sins, He is faithful and just and will forgive us our sins and purify us from all unrighteousness." — 1 John 1:9',
    63: '"Grace, mercy and peace from God the Father and from Jesus Christ, the Father's Son, will be with us in truth and love." — 2 John 1:3',
    64: '"I have no greater joy than to hear that my children are walking in the truth." — 3 John 1:4',
    65: '"To Him who is able to keep you from stumbling and to present you before His glorious presence without fault." — Jude 1:24',
    66: '"Behold, I am coming soon! Blessed is the one who keeps the words of the prophecy written in this scroll." — Revelation 22:7',
}

# Directory containing the markdown files
bible_dir = r'src\content\bible'

for book_num in range(36, 67):
    # Find the file
    files = [f for f in os.listdir(bible_dir) if f.startswith(f'{book_num:02d}-')]
    if not files:
        print(f"Skipping {book_num} - file not found")
        continue
    
    filepath = os.path.join(bible_dir, files[0])
    
    # Read the file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Read first 12 lines to get the verse
    lines = content.split('\n')
    verse_line = None
    for i, line in enumerate(lines):
        if line.startswith('> "'):
            # Extract verse text
            verse_match = re.search(r'> "(.*?)" — \*\*(.*?)\*\*', line)
            if verse_match:
                verse_text = verse_match.group(1)
                verse_ref = verse_match.group(2).replace('**', '')
                verse_line = f'"{verse_text}" — {verse_ref}'
                break
    
    if not verse_line:
        print(f"Skipping {book_num} - verse not found")
        continue
    
    # Find and update the frontmatter
    frontmatter_match = re.search(r'(---\n.*?---)', content, re.DOTALL)
    if frontmatter_match:
        old_frontmatter = frontmatter_match.group(1)
        # Add verse field after description
        new_frontmatter = re.sub(
            r"(description: '[^']*')\n",
            f"\\1\nverse: '{verse_line}'\n",
            old_frontmatter
        )
        
        new_content = content.replace(old_frontmatter, new_frontmatter)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"Updated {files[0]}")

print("Done!")
