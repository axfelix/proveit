import sys
import os
import bagit
from time import strftime
from zipfile import ZipFile
import tempfile
import zerorpc
import shutil
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
            bag_files = []
            for x in bag.payload_files(): bag_files.append(x)
            return bag_files, bag.info
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
        bag_destination = os.path.join(export_path, Path(bag_path).stem)
        zipname = shutil.make_archive(bag_destination, 'zip', tempdir.name)
        return True

    def teardown(self):
        tempdir.cleanup()

if __name__ == '__main__':
    s = zerorpc.Server(ProveIt())
    s.bind('tcp://127.0.0.1:' + str(sys.argv[1]))
    s.run()
    