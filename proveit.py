import sys
import os
import bagit
from time import strftime
from zipfile import ZipFile
import tempfile
import zerorpc
import shutil
import PyPDF2
from pathlib import Path

bag_path = None
bag = None
tempdir = None

class ProveIt(object):
    def bag_load(self, bag_path):
        global bag
        global tempdir
        tempdir = tempfile.TemporaryDirectory()
        ZipFile(bag_path).extractall(path=tempdir.name)
        try:
            bag = bagit.Bag(path=tempdir.name)
        except:
            return False, False

        if bag.is_valid():
            encrypted_files = []
            for x in bag.payload_files():
                if Path(x).suffix == '.pdf':
                    with open(x, mode='rb') as pdf:
                        reader = PyPDF2.PdfFileReader(pdf)
                        if reader.isEncrypted:
                            encrypted_files.append(x)
                elif Path(x).suffix == '.zip':
                    with ZipFille(x) as zippy:
                        try:
                            zippy.open(zippy.namelist()[0])
                        except RuntimeError:
                            encrypted_files.append(x)
            return bag.info, encrypted_files

        else:
            bad_files = []
            try:
                bag.validate()
            except bagit.BagValidationError as e:
                for d in e.details:
                    if isinstance(d, bagit.ChecksumMismatch):
                        bad_files.append(d.path)
            return False, bad_files

    def bag_update(self, new_metadata, bag_path, export_path):
        for x, y, z in new_metadata:
            if x != "Untitled":
                bag.info[x] = y
        bag.save(manifests=True)
        bag_destination = os.path.join(export_path.strip("\""), Path(bag_path).stem)
        zipname = shutil.make_archive(bag_destination, 'zip', tempdir.name)
        return True

    def teardown(self):
        tempdir.cleanup()

if __name__ == '__main__':
    s = zerorpc.Server(ProveIt())
    s.bind('tcp://127.0.0.1:' + str(sys.argv[1]))
    s.run()
    