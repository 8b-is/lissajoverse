import importlib.util
import io
from pathlib import Path
import unittest
from unittest.mock import patch
from urllib.error import URLError

spec = importlib.util.spec_from_file_location('crawler', Path(__file__).resolve().parents[1] / 'tools/wikicrawl.py')
crawler = importlib.util.module_from_spec(spec)
spec.loader.exec_module(crawler)

class RobotsTests(unittest.TestCase):
    def setUp(self):
        crawler.ROBOTS_CACHE.clear()

    def test_unavailable_rules_prevent_article_request(self):
        with patch.object(crawler.urllib.request, 'urlopen', side_effect=URLError('offline')) as request:
            self.assertEqual(crawler.page_links('Test', 2), [])
            self.assertEqual(request.call_count, 1)
            self.assertEqual(request.call_args.args[0].full_url, crawler.ROBOTS_URL)
            self.assertFalse(crawler.allowed(crawler.WIKI + '/wiki/Test'))
            self.assertEqual(request.call_count, 1)

    def test_explicit_disallow_prevents_article_request(self):
        with patch.object(crawler.urllib.request, 'urlopen', return_value=io.BytesIO(b'User-agent: *\nDisallow: /wiki/\n')) as request:
            self.assertEqual(crawler.page_links('Test', 2), [])
            self.assertEqual(request.call_count, 1)

    def test_explicit_allow_fetches_article(self):
        with patch.object(crawler.urllib.request, 'urlopen', side_effect=[io.BytesIO(b'User-agent: *\nAllow: /wiki/\n'), io.BytesIO(b'<a href="/wiki/Example">Example</a>')]) as request:
            self.assertEqual(crawler.page_links('Test', 2), ['Example'])
            self.assertEqual(request.call_count, 2)

if __name__ == '__main__':
    unittest.main()
